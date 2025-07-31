--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select nullif(current_setting('request.jwt.claim.email', true), '')::text;
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select nullif(current_setting('request.jwt.claim.role', true), '')::text;
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
    select string_to_array(name, '/') into _parts;
    select _parts[array_length(_parts,1)] into _filename;
    -- @todo return the last part instead of 2
    return split_part(_filename, '.', 2);
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
_bucketId text;
BEGIN
    -- will be replaced by migrations when server starts
    -- saving space for cloud-init
END
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer) OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: AttributeValue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AttributeValue" (
    id text NOT NULL,
    "attributeId" text NOT NULL,
    value text NOT NULL,
    label text,
    "hexColor" text,
    "priceModifier" double precision,
    "inStock" boolean DEFAULT true NOT NULL,
    "imageUrl" text
);


ALTER TABLE public."AttributeValue" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    slug text NOT NULL,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    icon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inventory" (
    id text NOT NULL,
    "productId" text NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    "stockThreshold" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Inventory" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    slug text NOT NULL,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    description_en text,
    description_ar text,
    image text NOT NULL,
    price double precision NOT NULL,
    "inStock" boolean DEFAULT true NOT NULL,
    rating double precision DEFAULT 0,
    reviews integer DEFAULT 0,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductAttribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductAttribute" (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    type text NOT NULL
);


ALTER TABLE public."ProductAttribute" OWNER TO postgres;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    sku text,
    price double precision,
    image text,
    "inStock" boolean DEFAULT true NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "attributeValues" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO postgres;

--
-- Name: StockHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockHistory" (
    id text NOT NULL,
    change integer NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."StockHistory" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: AttributeValue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AttributeValue" (id, "attributeId", value, label, "hexColor", "priceModifier", "inStock", "imageUrl") FROM stdin;
val-1	attr-1	black	Black	#000000	\N	t	\N
val-2	attr-1	white	White	#FFFFFF	\N	t	\N
val-3	attr-1	silver	Silver	#C0C0C0	5	t	\N
val-11	attr-4	s	Small	\N	\N	t	\N
val-12	attr-4	m	Medium	\N	\N	t	\N
val-13	attr-4	l	Large	\N	2	t	\N
val-14	attr-4	xl	Extra Large	\N	4	t	\N
val-15	attr-5	blue	Blue	#0000FF	\N	t	\N
val-16	attr-5	red	Red	#FF0000	\N	t	\N
val-17	attr-5	green	Green	#008000	\N	t	\N
cmdjzbith000mg03awcgcgj31	cmdjzbith000lg03amsuc95b2	us7	US 7	\N	0	t	\N
cmdjzbith000ng03aqo56xwrn	cmdjzbith000lg03amsuc95b2	us8	US 8	\N	0	t	\N
cmdjzbith000og03arc49e63d	cmdjzbith000lg03amsuc95b2	us9	US 9	\N	0	t	\N
cmdjzbiti000pg03auianu8tt	cmdjzbith000lg03amsuc95b2	us10	US 10	\N	0	f	\N
cmdjzbiti000rg03anyyalpbh	cmdjzbiti000qg03ahsoz5ul3	black	Black	#000000	0	t	\N
cmdjzbiti000sg03a5c5ndvx5	cmdjzbiti000qg03ahsoz5ul3	white	White	#FFFFFF	0	t	\N
cmdjzbiti000tg03aea1de16o	cmdjzbiti000qg03ahsoz5ul3	red	Red	#FF0000	0	t	\N
cmdlm6z1y0001g0l8zgdgl521	cmdlm6z1y0000g0l88ust4t1g	black	black	#000000	0	t	\N
cmdlm6z1y0002g0l8x7r1nu94	cmdlm6z1y0000g0l88ust4t1g	silver	silver	#eefff2	0	t	\N
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, slug, name_en, name_ar, icon, "createdAt") FROM stdin;
cat-1	electronics	Electronics	الإلكترونيات	📱	2025-07-19 04:25:09.905
cat-2	fashion	Fashion	الأزياء	👕	2025-07-19 04:25:09.905
cat-3	home	Home & Kitchen	المنزل والمطبخ	🏠	2025-07-19 04:25:09.905
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inventory" (id, "productId", stock, "stockThreshold", "createdAt", "updatedAt") FROM stdin;
inv-3	prod-3	50	15	2025-07-19 04:25:09.961	2025-07-19 04:25:09.961
inv-1	prod-1	44	10	2025-07-19 04:25:09.961	2025-07-26 09:07:32.152
inv-4	prod-4	63	20	2025-07-19 04:25:09.961	2025-07-29 06:27:56.813
inv-2	prod-2	50	15	2025-07-19 04:25:09.961	2025-07-29 06:29:15.07
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, slug, name_en, name_ar, description_en, description_ar, image, price, "inStock", rating, reviews, "categoryId", "createdAt") FROM stdin;
prod-1	wireless-headphones	Wireless Headphones	سماعات لاسلكية	High-quality wireless headphones with noise cancellation	سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء	/images/products/headphones.jpg	99.99	t	4.5	128	cat-1	2025-07-19 04:25:09.916
prod-3	coffee-maker	Coffee Maker	صانعة القهوة	Programmable coffee maker with timer	صانعة قهوة قابلة للبرمجة مع مؤقت	data:image/jpeg;base64,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	79.99	t	4.7	203	cat-3	2025-07-19 04:25:09.916
prod-4	demo-t-shirt	Demo T-Shirt	تيشيرت تجريبي	A demo t-shirt with multiple variants	تيشيرت تجريبي مع عدة خيارات	/images/products/tshirt.jpg	25.99	t	4	45	cat-2	2025-07-19 04:25:09.916
prod-2	running-shoes	Running Shoes	أحذية الجري	Lightweight running shoes with superior comfort	أحذية جري خفيفة الوزن مع راحة فائقة	data:image/jpeg;base64,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	129.99	t	4.2	156	cat-2	2025-07-19 04:25:09.916
\.


--
-- Data for Name: ProductAttribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductAttribute" (id, "productId", name, type) FROM stdin;
attr-1	prod-1	Color	color
attr-4	prod-4	Size	size
attr-5	prod-4	Color	color
cmdjzbith000lg03amsuc95b2	prod-2	Size	size
cmdjzbiti000qg03ahsoz5ul3	prod-2	Color	color
cmdlm6z1y0000g0l88ust4t1g	prod-3	color	color
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariant" (id, "productId", sku, price, image, "inStock", "stockQuantity", "attributeValues", "createdAt") FROM stdin;
var-1	prod-1	WH-BLACK	\N	\N	t	20	{"Color": "Black"}	2025-07-19 04:25:09.948
var-2	prod-1	WH-WHITE	\N	\N	t	15	{"Color": "White"}	2025-07-19 04:25:09.948
var-3	prod-1	WH-SILVER	104.99	\N	t	8	{"Color": "Silver"}	2025-07-19 04:25:09.948
var-11	prod-4	TS-S-BLUE	\N	\N	t	12	{"Size": "Small", "Color": "Blue"}	2025-07-19 04:25:09.948
var-12	prod-4	TS-S-RED	\N	\N	t	10	{"Size": "Small", "Color": "Red"}	2025-07-19 04:25:09.948
var-13	prod-4	TS-M-BLUE	\N	\N	t	15	{"Size": "Medium", "Color": "Blue"}	2025-07-19 04:25:09.948
var-14	prod-4	TS-M-RED	\N	\N	t	8	{"Size": "Medium", "Color": "Red"}	2025-07-19 04:25:09.948
var-15	prod-4	TS-M-GREEN	\N	\N	t	6	{"Size": "Medium", "Color": "Green"}	2025-07-19 04:25:09.948
var-16	prod-4	TS-L-BLUE	27.99	\N	t	5	{"Size": "Large", "Color": "Blue"}	2025-07-19 04:25:09.948
var-17	prod-4	TS-L-RED	27.99	\N	t	3	{"Size": "Large", "Color": "Red"}	2025-07-19 04:25:09.948
var-18	prod-4	TS-XL-BLUE	29.99	\N	t	2	{"Size": "Extra Large", "Color": "Blue"}	2025-07-19 04:25:09.948
cmdjzbiti000ug03a9vxcqf6c	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0001g03andg8ojys", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0006g03aiqq82a81"}	2025-07-26 08:19:21.989
cmdjzbiti000vg03auh74b7jx	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0001g03andg8ojys", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0007g03agbb5dzfp"}	2025-07-26 08:19:21.989
cmdjzbiti000wg03ad01uockc	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0001g03andg8ojys", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0008g03ads9sc2ha"}	2025-07-26 08:19:21.989
cmdjzbiti000xg03atplg9a5c	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0002g03aj8lz9ay0", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0006g03aiqq82a81"}	2025-07-26 08:19:21.989
cmdjzbiti000yg03auokzrbxy	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0002g03aj8lz9ay0", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0007g03agbb5dzfp"}	2025-07-26 08:19:21.989
cmdjzbiti000zg03afuexl9zg	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0002g03aj8lz9ay0", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0008g03ads9sc2ha"}	2025-07-26 08:19:21.989
cmdjzbiti0010g03auzq5qw60	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0003g03asj7qr1xo", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0006g03aiqq82a81"}	2025-07-26 08:19:21.989
cmdjzbiti0011g03af95eg4fm	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0003g03asj7qr1xo", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0007g03agbb5dzfp"}	2025-07-26 08:19:21.989
cmdjzbiti0012g03ac4j8pfsz	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0003g03asj7qr1xo", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0008g03ads9sc2ha"}	2025-07-26 08:19:21.989
cmdjzbiti0013g03a1l2rjyj4	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0004g03asgbrf0vd", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0006g03aiqq82a81"}	2025-07-26 08:19:21.989
cmdjzbiti0014g03agnjvcfrj	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0004g03asgbrf0vd", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0007g03agbb5dzfp"}	2025-07-26 08:19:21.989
cmdjzbiti0015g03a10tfywp9	prod-2		\N		t	0	{"cmdjzazil0000g03ae9kaa7pp": "cmdjzazil0004g03asgbrf0vd", "cmdjzazil0005g03aphvjdtno": "cmdjzazim0008g03ads9sc2ha"}	2025-07-26 08:19:21.989
cmdlm6z1y0003g0l8h88m1505	prod-3		\N		t	0	{"cmdlk2ygt0000g0nzmezpehjf": "cmdlk2ygu0001g0nzbi9o92vh"}	2025-07-27 11:47:27.093
cmdlm6z1z0004g0l85iux7jgt	prod-3		\N		t	0	{"cmdlk2ygt0000g0nzmezpehjf": "cmdlk2ygu0002g0nz556lws9m"}	2025-07-27 11:47:27.093
\.


--
-- Data for Name: StockHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockHistory" (id, change, reason, "createdAt", "productId") FROM stdin;
hist-1	43	Initial stock with variants	2025-07-19 04:25:09.97	prod-1
hist-2	50	Initial stock	2025-07-19 04:25:09.97	prod-2
hist-3	-7	Sales	2025-07-19 04:25:09.97	prod-2
hist-4	50	Initial stock	2025-07-19 04:25:09.97	prod-3
hist-5	70	Initial stock	2025-07-19 04:25:09.97	prod-4
hist-6	-9	Sales	2025-07-19 04:25:09.97	prod-4
cmdk11gvt0017g03amr0yvwvq	1	restock	2025-07-26 09:07:32.153	prod-1
cmdo5nsig0001g0b6bmphxnya	2	correction	2025-07-29 06:27:56.824	prod-4
cmdo5otcs0003g0b6a8gy6o55	-52	sale	2025-07-29 06:28:44.572	prod-2
cmdo5pgw10005g0b69jp9p9y6	50	restock	2025-07-29 06:29:15.073	prod-2
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c3fbe42e-794f-42fb-8517-7771e96590d9	ada3ff03e2ddc9aae75e227c79691a2b89d1ffdd5cfcb9e157e99a7365b1e775	2025-07-19 04:08:32.59363+00	20250119040500_init_with_inventory		\N	2025-07-19 04:08:32.59363+00	0
7ad9ac30-b043-4948-8037-ce1d096b0bbc	10dea216abc6da8e8fcdab2c2ad9e60507730209787d5ee64e1bf189f13e5956	\N	20250717093016_add_slug_to_product	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250717093016_add_slug_to_product\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "Product" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"Product\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(636), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250717093016_add_slug_to_product"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250717093016_add_slug_to_product"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:236	2025-07-29 06:38:43.664703+00	2025-07-19 04:07:51.553834+00	0
68b0957c-4b1b-4d40-b4ec-6f053912fe15	02ae8bbc6c5506dcc4ce15dd41bdc2a7423305315466372b791314ac568f17d3	2025-07-29 06:38:43.669998+00	20250717093016_add_slug_to_product		\N	2025-07-29 06:38:43.669998+00	0
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-07-17 11:58:09.471785+00
20210809183423_update_grants	2025-07-17 11:58:09.471785+00
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: AttributeValue AttributeValue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttributeValue"
    ADD CONSTRAINT "AttributeValue_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: ProductAttribute ProductAttribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductAttribute"
    ADD CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: StockHistory StockHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockHistory"
    ADD CONSTRAINT "StockHistory_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens USING btree (token);


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, email);


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Inventory_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Inventory_productId_key" ON public."Inventory" USING btree ("productId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: AttributeValue AttributeValue_attributeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AttributeValue"
    ADD CONSTRAINT "AttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES public."ProductAttribute"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductAttribute ProductAttribute_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductAttribute"
    ADD CONSTRAINT "ProductAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockHistory StockHistory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockHistory"
    ADD CONSTRAINT "StockHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: buckets buckets_owner_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_owner_fkey FOREIGN KEY (owner) REFERENCES auth.users(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: objects objects_owner_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_owner_fkey FOREIGN KEY (owner) REFERENCES auth.users(id);


--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION extension(name text); Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON FUNCTION storage.extension(name text) TO anon;
GRANT ALL ON FUNCTION storage.extension(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.extension(name text) TO service_role;
GRANT ALL ON FUNCTION storage.extension(name text) TO dashboard_user;
GRANT ALL ON FUNCTION storage.extension(name text) TO postgres;


--
-- Name: FUNCTION filename(name text); Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON FUNCTION storage.filename(name text) TO anon;
GRANT ALL ON FUNCTION storage.filename(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.filename(name text) TO service_role;
GRANT ALL ON FUNCTION storage.filename(name text) TO dashboard_user;
GRANT ALL ON FUNCTION storage.filename(name text) TO postgres;


--
-- Name: FUNCTION foldername(name text); Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON FUNCTION storage.foldername(name text) TO anon;
GRANT ALL ON FUNCTION storage.foldername(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.foldername(name text) TO service_role;
GRANT ALL ON FUNCTION storage.foldername(name text) TO dashboard_user;
GRANT ALL ON FUNCTION storage.foldername(name text) TO postgres;


--
-- Name: FUNCTION search(prefix text, bucketname text, limits integer, levels integer, offsets integer); Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer) TO anon;
GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer) TO authenticated;
GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer) TO service_role;
GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer) TO dashboard_user;
GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer) TO postgres;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT ALL ON TABLE auth.audit_log_entries TO postgres;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT ALL ON TABLE auth.instances TO postgres;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT ALL ON TABLE auth.refresh_tokens TO postgres;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT ALL ON TABLE auth.users TO postgres;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

