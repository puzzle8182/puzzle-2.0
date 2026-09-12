SET local check_function_bodies = off;

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "service_role";

REVOKE ALL ON FUNCTION "public"."convidar_admin_plataforma"(text) FROM "anon";

REVOKE ALL ON FUNCTION "public"."convidar_admin_plataforma"(text) FROM "service_role";

REVOKE ALL ON FUNCTION "public"."current_role_is"(public.app_role) FROM "anon";

REVOKE ALL ON FUNCTION "public"."current_role_is"(public.app_role) FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."current_role_is"(public.app_role) FROM "service_role";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "service_role";

REVOKE ALL ON FUNCTION "public"."is_admin_of_empresa"(uuid) FROM "anon";

REVOKE ALL ON FUNCTION "public"."is_admin_of_empresa"(uuid) FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."is_admin_of_empresa"(uuid) FROM "service_role";

REVOKE ALL ON FUNCTION "public"."is_admin_plataforma"() FROM "anon";

REVOKE ALL ON FUNCTION "public"."is_admin_plataforma"() FROM "authenticated";

REVOKE ALL ON FUNCTION "public"."is_admin_plataforma"() FROM "service_role";

CREATE EXTENSION "pg_net" SCHEMA "public";

CREATE TABLE "corporate"."convites_colaborador" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "empresa_id" uuid                     NOT NULL,
  "email"      text                     NOT NULL,
  "status"     text                     NOT NULL DEFAULT 'pendente'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "aceito_em"  timestamp with time zone,
  CONSTRAINT "convites_colaborador_email_unique" UNIQUE (email),
  CONSTRAINT "convites_colaborador_pkey" PRIMARY KEY (id),
  CONSTRAINT "convites_colaborador_status_check" CHECK ((status = ANY (ARRAY['pendente'::text, 'aceito'::text])))
);

ALTER TABLE "corporate"."convites_colaborador"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

ALTER TABLE "corporate"."convites_colaborador"
  ADD CONSTRAINT "convites_colaborador_empresa_id_fkey" FOREIGN KEY (empresa_id) REFERENCES corporate.empresas(id) ON DELETE CASCADE;

CREATE POLICY "convites_select_empresa_admin" ON "corporate"."convites_colaborador"
  FOR SELECT
  TO PUBLIC
  USING (public.is_admin_of_empresa(empresa_id));

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

COMMENT ON EXTENSION "pg_net" IS 'Async HTTP';

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "postgres";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "corporate"."convites_colaborador" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "corporate"."convites_colaborador" TO "postgres";

REVOKE ALL ON TABLE "public"."convites_admin_plataforma" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."convites_admin_plataforma" TO "anon";

REVOKE ALL ON TABLE "public"."convites_admin_plataforma" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."convites_admin_plataforma" TO "service_role";

REVOKE ALL ON TABLE "public"."profiles" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."profiles" TO "anon";

REVOKE ALL ON TABLE "public"."profiles" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."profiles" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "service_role";

