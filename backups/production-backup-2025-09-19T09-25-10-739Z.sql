--
-- PostgreSQL database dump
--

\restrict vyTF7XDslyqQD1MAkzbeE1fTTcTRRUN0KmEgdNUo3uU05YsGdriVHUvbjUXnojC

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 17.6 (Homebrew)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: kataria
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO kataria;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: kataria
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: kataria
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO kataria;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: kataria
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO kataria;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: kataria
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO kataria;

--
-- Name: RegistrationStatus; Type: TYPE; Schema: public; Owner: kataria
--

CREATE TYPE public."RegistrationStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."RegistrationStatus" OWNER TO kataria;

--
-- Name: TrainingType; Type: TYPE; Schema: public; Owner: kataria
--

CREATE TYPE public."TrainingType" AS ENUM (
    'OYSTER',
    'BUTTON',
    'SHIITAKE',
    'GANODERMA'
);


ALTER TYPE public."TrainingType" OWNER TO kataria;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: kataria
--

CREATE TYPE public."UserRole" AS ENUM (
    'CUSTOMER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO kataria;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: kataria
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


ALTER TABLE public._prisma_migrations OWNER TO kataria;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO kataria;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    img text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "metaTitle" text,
    "metaDescription" text
);


ALTER TABLE public.blog_posts OWNER TO kataria;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO kataria;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    img text NOT NULL,
    path text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO kataria;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO kataria;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: instructors; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.instructors (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    bio text,
    expertise text,
    experience integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.instructors OWNER TO kataria;

--
-- Name: instructors_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.instructors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instructors_id_seq OWNER TO kataria;

--
-- Name: instructors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.instructors_id_seq OWNED BY public.instructors.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    "orderId" text NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO kataria;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total double precision NOT NULL,
    subtotal double precision NOT NULL,
    tax double precision DEFAULT 0 NOT NULL,
    shipping double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "customerPhone" text,
    "shippingAddress" jsonb NOT NULL,
    "userId" text
);


ALTER TABLE public.orders OWNER TO kataria;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "categoryId" integer NOT NULL
);


ALTER TABLE public.product_categories OWNER TO kataria;

--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_categories_id_seq OWNER TO kataria;

--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: product_discounts; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.product_discounts (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    type public."DiscountType" NOT NULL,
    value double precision NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_discounts OWNER TO kataria;

--
-- Name: product_discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.product_discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_discounts_id_seq OWNER TO kataria;

--
-- Name: product_discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.product_discounts_id_seq OWNED BY public.product_discounts.id;


--
-- Name: product_notifications; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.product_notifications (
    id text NOT NULL,
    email text NOT NULL,
    "productId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_notifications OWNER TO kataria;

--
-- Name: products; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.products (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "measurementValue" integer NOT NULL,
    "measurementType" text NOT NULL,
    "inStock" boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    imgs jsonb NOT NULL,
    specifications jsonb NOT NULL,
    "howToConsume" jsonb NOT NULL,
    "additionalInfo" jsonb NOT NULL,
    benefits json
);


ALTER TABLE public.products OWNER TO kataria;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO kataria;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: promotional_banners; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.promotional_banners (
    id integer NOT NULL,
    title text NOT NULL,
    subtitle text,
    description text,
    discount text,
    "buttonText" text DEFAULT 'Buy Now'::text NOT NULL,
    "buttonLink" text,
    "productId" integer,
    "categoryId" integer,
    "imageUrl" text NOT NULL,
    "bgColor" text DEFAULT '#F5F5F7'::text NOT NULL,
    "textColor" text DEFAULT '#000000'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.promotional_banners OWNER TO kataria;

--
-- Name: promotional_banners_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.promotional_banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotional_banners_id_seq OWNER TO kataria;

--
-- Name: promotional_banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.promotional_banners_id_seq OWNED BY public.promotional_banners.id;


--
-- Name: recently_viewed; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.recently_viewed (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public.recently_viewed OWNER TO kataria;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    rating integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "productId" integer NOT NULL,
    "userId" text,
    comment text
);


ALTER TABLE public.reviews OWNER TO kataria;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO kataria;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO kataria;

--
-- Name: training_programs; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.training_programs (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    duration integer NOT NULL,
    "dailyHours" text DEFAULT '5-6 hours'::text NOT NULL,
    type public."TrainingType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.training_programs OWNER TO kataria;

--
-- Name: training_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.training_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_programs_id_seq OWNER TO kataria;

--
-- Name: training_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.training_programs_id_seq OWNED BY public.training_programs.id;


--
-- Name: training_registrations; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.training_registrations (
    id text NOT NULL,
    "registrationNumber" text NOT NULL,
    status public."RegistrationStatus" DEFAULT 'PENDING'::public."RegistrationStatus" NOT NULL,
    "participantName" text NOT NULL,
    "participantEmail" text NOT NULL,
    "participantPhone" text NOT NULL,
    "participantAddress" jsonb NOT NULL,
    "preferredStartDate" timestamp(3) without time zone,
    "specialRequirements" text,
    "totalAmount" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "trainingProgramId" integer NOT NULL,
    "userId" text,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" text,
    "paymentReference" text,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "upiTransactionId" text
);


ALTER TABLE public.training_registrations OWNER TO kataria;

--
-- Name: training_schedules; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.training_schedules (
    id integer NOT NULL,
    "trainingProgramId" integer NOT NULL,
    "dayNumber" integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    topics jsonb NOT NULL,
    "practicalSessions" jsonb NOT NULL,
    "theoreticalSessions" jsonb NOT NULL,
    "learningObjectives" jsonb NOT NULL,
    materials jsonb NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "instructorId" integer
);


ALTER TABLE public.training_schedules OWNER TO kataria;

--
-- Name: training_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: kataria
--

CREATE SEQUENCE public.training_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_schedules_id_seq OWNER TO kataria;

--
-- Name: training_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kataria
--

ALTER SEQUENCE public.training_schedules_id_seq OWNED BY public.training_schedules.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    phone text,
    role public."UserRole" DEFAULT 'CUSTOMER'::public."UserRole" NOT NULL,
    password text,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO kataria;

--
-- Name: verificationtokens; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.verificationtokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verificationtokens OWNER TO kataria;

--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: kataria
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO kataria;

--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: instructors id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.instructors ALTER COLUMN id SET DEFAULT nextval('public.instructors_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: product_discounts id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_discounts ALTER COLUMN id SET DEFAULT nextval('public.product_discounts_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: promotional_banners id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.promotional_banners ALTER COLUMN id SET DEFAULT nextval('public.promotional_banners_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: training_programs id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_programs ALTER COLUMN id SET DEFAULT nextval('public.training_programs_id_seq'::regclass);


--
-- Name: training_schedules id; Type: DEFAULT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_schedules ALTER COLUMN id SET DEFAULT nextval('public.training_schedules_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
451a4337-86ca-4513-99fe-2a22adb1c896	de97cfe66cd8cc78c17512cf87daf112c25992e62e6ce6d7182bd1647343ab68	\N	20250917163000_add_instructorid_to_training_schedules	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250917163000_add_instructorid_to_training_schedules\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "instructorId" of relation "training_schedules" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"instructorId\\" of relation \\"training_schedules\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7282), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250917163000_add_instructorid_to_training_schedules"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250917163000_add_instructorid_to_training_schedules"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:236	2025-09-19 02:25:09.686412+05:30	2025-09-19 02:21:59.699841+05:30	0
e5dffbb0-85e8-418b-8ab5-970d455a83f7	275c524d76867a761df7bb070b442c9b3aee6111a0f51dbafb44f7e27a32185a	2025-09-17 14:58:48.35549+05:30	20250902033850_init	\N	\N	2025-09-17 14:58:48.321407+05:30	1
1b6f90a5-fda1-4b6e-bfd5-a921d5b9707b	de97cfe66cd8cc78c17512cf87daf112c25992e62e6ce6d7182bd1647343ab68	2025-09-19 02:25:09.6879+05:30	20250917163000_add_instructorid_to_training_schedules		\N	2025-09-19 02:25:09.6879+05:30	0
ba3db3fd-3093-49f2-b48b-08c69df31dd8	0a22f9dcc2a2baaa18e20647b5062c34fd45c267febc55824f39241a29361798	2025-09-17 14:58:48.356993+05:30	20250902103501_add_comment_to_review	\N	\N	2025-09-17 14:58:48.355807+05:30	1
ce8f3ad3-0961-42dc-8560-ddd8d7fe872d	d807ef212c90beb23421ad024099d4e7409f8a4c3a8a62a0269946c99eb8d29a	2025-09-17 14:58:48.364115+05:30	20250913131615_add_promotional_banners	\N	\N	2025-09-17 14:58:48.357297+05:30	1
b8ec66d7-930e-4c43-afb9-f1466ae0cf22	03285a02dbe19f15a567afe0cdcfae294c4121b371338564f9ddf817c2f12b18	2025-09-17 14:58:48.378365+05:30	20250913142210_fix_promotional_banners_production	\N	\N	2025-09-17 14:58:48.364412+05:30	1
c2845a54-c923-425d-b3c3-15a232d69f64	24aaf3c07733c916adad77bcb118e7c07ee7865f05693eaf9c4b40aaf4c5bbcf	2025-09-17 14:58:48.386613+05:30	20250913160802_add_training_programs	\N	\N	2025-09-17 14:58:48.379479+05:30	1
7fe81f3c-e0d0-4932-bc97-656ca55b7a86	333266f0127be6ae98e9ceca500db9ed1951ba34c5779b340bb0c04aa7cc69bf	2025-09-17 14:58:48.388671+05:30	20250913163153_add_payment_fields_to_training_registration	\N	\N	2025-09-17 14:58:48.386886+05:30	1
18fb7d96-8443-40c1-b223-d51d57506e83	d73ecb6e5afd914cd095f3d86a506a4502d3c47a6a376f1f1dc6792719b2c156	2025-09-17 14:58:48.389997+05:30	20250913172210_fix_category_paths	\N	\N	2025-09-17 14:58:48.388993+05:30	1
123accf3-0f4c-4a92-833f-7a73a946b20c	47c1ba38d7f0b9f0024568ad4b5d7de53b89653daed9d87a8576ba1a5a66a8e4	2025-09-17 14:58:48.39238+05:30	20250914064133_fix_production_category_paths_conflict	\N	\N	2025-09-17 14:58:48.390252+05:30	1
e91f4a80-af2f-439a-8fd4-0ffef409fa3c	a65b40995f8ce8d2c9a77e93e1fdf371b5caea7fc2dfbe2b4e46093974f4cfb9	2025-09-17 14:58:48.396123+05:30	20250917083022_add_training_schedule	\N	\N	2025-09-17 14:58:48.392627+05:30	1
60f60bd5-7e74-4cbe-8e4c-4a0c19082d65	4238e40135c73a0e9cebb29165e9bf23b02e7a9ce6556afe368f31b3e99952ed	2025-09-17 14:58:48.399942+05:30	20250917092535_add_instructor_model	\N	\N	2025-09-17 14:58:48.396395+05:30	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.blog_posts (id, title, slug, content, excerpt, img, views, published, "createdAt", "updatedAt", "metaTitle", "metaDescription") FROM stdin;
1	From Spore to Plate: The Ultimate Guide to Growing Oyster Mushrooms at Home	growing-oyster-mushrooms-guide	Complete guide content here...	Learn how to grow delicious oyster mushrooms at home with this comprehensive guide.	/images/blog/oyster-blog-01.png	100000	t	2025-09-01 23:21:23.347	2025-09-01 23:21:23.347	How to Grow Oyster Mushrooms at Home - Complete Guide	Step-by-step guide to growing oyster mushrooms at home. Learn about spawn, growing conditions, and harvesting techniques.
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.categories (id, title, slug, img, path, description, "createdAt", "updatedAt") FROM stdin;
1	Edible	edible	/images/categories/edible_mushrooms.png	/shop?category=edible	Fresh edible mushrooms for culinary use	2025-09-01 23:20:49.677	2025-09-14 02:54:25.518
2	Tinctures	tinctures	/images/categories/generic_tincture.png	/shop?category=tinctures	Concentrated mushroom tinctures and extracts	2025-09-01 23:20:49.677	2025-09-14 02:54:25.518
3	Dry Powder	powders	/images/categories/powders.png	/shop?category=powders	Dried mushroom powders and supplements	2025-09-01 23:20:49.677	2025-09-14 02:54:25.518
\.


--
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.instructors (id, name, email, phone, bio, expertise, experience, "isActive", "createdAt", "updatedAt") FROM stdin;
1	Vikrant Rai	vikrant.rai@mushmush.com	+91 98765 43210	Expert in oyster mushroom cultivation with over 8 years of experience in commercial mushroom farming. Specializes in sustainable cultivation techniques and yield optimization.	Oyster Mushroom Cultivation, Commercial Farming, Sustainable Agriculture	8	t	2025-09-17 09:29:02.661	2025-09-17 10:26:49.121
2	Pravesh Rawat	pravesh.rawat@mushmush.com	+91 98765 43211	Specialist in button and shiitake mushroom cultivation with 10+ years of experience. Expert in spawn production, substrate preparation, and disease management.	Button Mushroom, Shiitake Mushroom, Spawn Production, Disease Management	10	t	2025-09-17 09:29:02.665	2025-09-17 10:26:49.134
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.order_items (id, quantity, price, "orderId", "productId") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.orders (id, "orderNumber", status, total, subtotal, tax, shipping, "createdAt", "updatedAt", "customerName", "customerEmail", "customerPhone", "shippingAddress", "userId") FROM stdin;
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.product_categories (id, "productId", "categoryId") FROM stdin;
1	1	1
2	1	3
3	2	2
4	5	1
\.


--
-- Data for Name: product_discounts; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.product_discounts (id, "productId", type, value, "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_notifications; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.product_notifications (id, email, "productId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.products (id, title, slug, description, price, "measurementValue", "measurementType", "inStock", featured, "createdAt", "updatedAt", imgs, specifications, "howToConsume", "additionalInfo", benefits) FROM stdin;
3	Shitake	shitake	Shiitake <i>(Lentinula edodes)</i> is one of the most popular and cultivated mushrooms worldwide, prized for its rich, savory taste and significant health benefits. Native to East Asia, it grows on decaying hardwood trees and has been a staple in Asian cuisine and traditional medicine for centuries. Its deep, umami flavor makes it a culinary cornerstone in many dishes.	499	100	gm	f	f	2025-09-01 23:21:08.218	2025-09-17 01:19:17.264	{"previews": ["/images/products/shitake_sticker.png", "/images/products/shitake_package.png", "/images/products/shitake_package_2.png", "/images/products/shitake_on_log.png", "/images/products/shitake.png"], "thumbnails": ["/images/products/shitake_sticker.png", "/images/products/shitake_package.png", "/images/products/shitake_package_2.png", "/images/products/shitake_on_log.png", "/images/products/shitake.png"]}	[{"label": "Product Name", "value": "Organic Shiitake Mushroom Powder (or Fresh/Dried)"}, {"label": "Botanical Name", "value": "Lentinula edodes"}, {"label": "Common Names", "value": "Shiitake, Forest Mushroom, Oak Mushroom"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fresh: Brown, umbrella-shaped cap with a fibrous stem. Powder: Light to medium brown."}, {"label": "Taste", "value": "Rich, umami, smoky, and earthy with a meaty texture"}, {"label": "Odor", "value": "Distinctive, savory, and earthy aroma"}]	["<strong>Sautéing and Stir-frying</strong>: This is a classic method that intensifies their flavor. Slice the caps and sauté in oil or butter with garlic and soy sauce. Their robust texture holds up well in stir-fries with other vegetables and proteins.", "<strong>Roasting</strong>: Roasting shiitakes brings out a deeper, more concentrated savory flavor. Toss whole or halved caps with oil and seasonings and roast at 200°C (400°F) for 15-20 minutes until the edges are caramelized and crispy.", "<strong>Soups and Broths</strong>: Shiitakes are essential for adding a deep, savory foundation to soups and broths, like Japanese miso soup or dashi stock. Both fresh and rehydrated dried mushrooms can be used.", "<strong>Grilling</strong>: Thread whole shiitake caps onto skewers, marinate them in a savory glaze (like teriyaki), and grill until tender and slightly charred. The tough stems can be used to flavor stocks and broths.", "<strong>Using Dried Shiitakes</strong>: Dried shiitakes have a more intense flavor than fresh ones. To use, rehydrate them in warm water for 20-30 minutes until soft. The flavorful soaking liquid can be strained and used as a broth in your recipe.", "<i>Medicinal Consumption: For centuries, shiitake has been used in traditional medicine for its health-promoting properties. Today, it is available in concentrated forms for therapeutic use:</i>", "<strong>Supplements</strong>: Shiitake extract is available in capsules, powders, and tinctures, primarily used to support immune function and cardiovascular health."]	["<strong>Appearance</strong>: Shiitake mushrooms have a distinct umbrella-shaped cap, typically ranging from 5 to 10 centimeters in diameter. The cap is light to dark brown, often with a slightly cracked or scaly texture on the surface. The gills underneath are white to light brown, and the stem is tough, fibrous, and usually removed before cooking.", "<strong>Flavor and Aroma</strong>: Shiitakes are renowned for their potent umami (savory) flavor, which is rich, smoky, and earthy. The aroma is equally robust and distinctive. When cooked, they develop a dense, meaty texture that is satisfyingly chewy.", "<strong>Nutritional Value</strong>: These mushrooms are an excellent source of B vitamins (especially pantothenic acid and B6), copper, selenium, manganese, and zinc. They are also rich in polysaccharides like lentinan and other unique bioactive compounds, which are studied for their immune-boosting and cholesterol-lowering properties."]	\N
4	Ganoderma's Tincture	ganoderma-s-tincture	Ganoderma Tincture, derived from the revered <i>Ganoderma lucidum</i> mushroom, is a potent liquid extract designed for modern wellness. Known for centuries in traditional medicine as 'Reishi' or the 'Mushroom of Immortality,' this tincture concentrates the mushroom's powerful adaptogenic properties. It's crafted to support stress management, enhance immune function, and promote overall vitality, making it a cornerstone for any natural health regimen.	1699	10	ml	t	f	2025-09-01 23:21:18.449	2025-09-18 21:37:07.235	{"previews": ["/images/products/ganoderma_tincture_sticker.png"], "thumbnails": ["/images/products/ganoderma_tincture_sticker.png"]}	[]	["<strong>Sublingual (Under the Tongue)</strong>: For fastest absorption, place a full dropper (approximately 1ml) directly under your tongue and hold it for 60-90 seconds before swallowing.", "<strong>Add to Beverages</strong>: Easily mix a dropperful into your morning coffee, tea, smoothie, or even a glass of water. The potent flavor is often best diluted in a drink.", "<strong>Consistent Daily Use</strong>: For best results, take 1-2 droppers daily. As an adaptogen, Ganoderma's benefits are most pronounced with consistent, long-term use.", "<strong>Evening Routine</strong>: Many users prefer taking Ganoderma tincture in the evening to help promote relaxation and support a restful night's sleep."]	[]	\N
5	Chantrelle	chantrelle	Chanterelle <i>(Cantharellus cibarius)</i> is a celebrated wild mushroom, famous for its beautiful golden color, delicate texture, and a subtle, fruity aroma reminiscent of apricots. Unlike cultivated mushrooms, chanterelles are foraged from forests, growing in symbiotic relationships with trees. They are a true gourmet delicacy, sought after by chefs and food lovers around the world.	699	100	gm	t	f	2025-09-01 23:21:04.837	2025-09-18 21:38:06.353	{"previews": ["/images/products/chantrelle_sticker.png", "/images/products/chantrelle_package.png", "/images/products/chantrelle.png"], "thumbnails": ["/images/products/chantrelle_sticker.png", "/images/products/chantrelle_package.png", "/images/products/chantrelle.png"]}	[]	["<strong>Simple Sauté</strong>: This is the best way to enjoy their unique flavor. Sauté them in butter or olive oil with a little garlic and fresh thyme or parsley. Their flavor is delicate, so they don't need much.", "<strong>Creamy Sauces</strong>: Chanterelles are famously used in creamy pasta sauces or served over steak or chicken. Their firm texture holds up beautifully in rich sauces.", "<strong>Soups and Risottos</strong>: Add them to risottos or creamy soups to impart a luxurious, earthy, and fruity flavor.", "<strong>Preserving</strong>: Chanterelles don't rehydrate well from a fully dried state. The best way to preserve them is to sauté them first and then freeze them in an airtight container."]	[]	\N
2	Lion's Mane	lions-mane	Lion's Mane (Hericium erinaceus), also known as the "pom-pom mushroom," is a unique and increasingly popular edible and medicinal fungus. Its striking appearance and remarkable health benefits have garnered significant attention in both culinary and wellness circles. Native to North America, Europe, and Asia, this mushroom typically grows on dead or dying hardwood trees, particularly oak and beech.	1599	100	gm	f	f	2025-09-01 23:21:13.542	2025-09-18 21:42:04.035	{"previews": ["/images/products/lions_mane.png"], "thumbnails": ["/images/products/lions_mane.png"]}	[{"label": "Product Name", "value": "Organic Lion's Mane Mushroom Powder (or Fresh/Dried)"}, {"label": "Botanical Name", "value": "Hericium erinaceus"}, {"label": "Common Names", "value": "Lion's Mane, Pom Pom Mushroom, Yamabushitake"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fresh: White, cascading, icicle-like spines. Powder: Creamy white to light beige."}, {"label": "Taste", "value": "Savory and mild, with a texture and flavor reminiscent of crab or lobster"}, {"label": "Odor", "value": "Subtle, earthy, and slightly sweet"}]	["<strong>Sautéing</strong>: This is one of the most popular and straightforward ways to prepare Lion's Mane. Heat a pan with a bit of butter or oil over medium heat. Add the sliced or torn mushroom and cook for about 5-7 minutes on each side, until it's golden brown and slightly crispy. Season with salt, pepper, garlic, and fresh herbs like thyme or parsley.", "<strong>Roasting</strong>: Roasting enhances the mushroom's natural sweetness and gives it a meatier texture. Toss the mushroom pieces with olive oil and your favorite seasonings. Spread them on a baking sheet and roast at 200°C (400°F) for 15-20 minutes, or until the edges are crispy.", "<strong>Crab Cakes</strong>: Due to its crab-like texture, Lion's Mane is an excellent ingredient for vegan or vegetarian \\"crab\\" cakes. Shred the mushroom, mix it with breadcrumbs, mayonnaise (or a vegan alternative), and seasonings, then form into patties and pan-fry until golden.", "<strong>Soups and Stews</strong>: Add chunks of Lion's Mane to soups and stews to impart a savory depth of flavor and a satisfying, meaty texture. It absorbs the surrounding flavors well.", "<strong>Sandwiches and Tacos</strong>: Sautéed or roasted Lion's Mane makes a delicious and hearty filling for sandwiches, tacos, and wraps. It's often used as a substitute for pulled pork or shredded chicken.", "<i>Medicinal Consumption: Beyond its culinary uses, Lion's Mane is widely consumed for its potential health benefits, particularly for cognitive function. For this purpose, it is available in various forms:</i>", "<strong>Supplements</strong>: Capsules, powders, and tinctures are popular ways to consume Lion's Mane for its medicinal properties. These can be found at health food stores and online.", "<strong>Mushroom Coffee and Tea</strong>: Lion's Mane powder is often added to coffee, tea, and other beverages for a daily cognitive boost."]	["<strong>Appearance</strong>: Lion's Mane is easily identifiable by its shaggy, icicle-like spines that cascade downwards, resembling a lion's mane or a frozen waterfall. Unlike traditional mushrooms with caps and gills, it has a single, clump-like structure that is white to off-white in color. As it matures, the tips of the spines may turn a slightly brownish hue. The texture is soft, spongy, and somewhat stringy, often compared to seafood like crab or lobster.", "<strong>Flavor and Aroma</strong>: When cooked, Lion's Mane has a mild, savory flavor that is often described as seafood-like, with a subtle sweetness. Its aroma is delicate and earthy. The texture is tender and chewy, which makes it a popular meat substitute in vegetarian and vegan dishes.", "<strong>Nutritional Value</strong>: This mushroom is a good source of protein, fiber, potassium, and various antioxidants. It is low in calories and fat. What truly sets Lion's Mane apart are its unique bioactive compounds, including hericenones and erinacines, which are believed to be responsible for its cognitive-enhancing properties."]	"{\\"immuneSupport\\":\\"Boosts immune system function and helps fight off infections\\",\\"energyBoost\\":\\"Provides natural energy enhancement and reduces fatigue\\",\\"stressRelief\\":\\"Helps manage stress and promotes mental well-being\\",\\"antiInflammatory\\":\\"Contains anti-inflammatory properties that support joint health\\",\\"antioxidant\\":\\"Rich in antioxidants that protect cells from damage\\"}"
1	Oyster Mushroom	oyster-mushroom	<strong>Oyster mushrooms</strong>, scientifically known as <strong>Pleurotus</strong>, are a popular and versatile variety of edible fungi cherished for their delicate flavor and velvety texture. Their name is derived from their characteristic shell-like appearance, with a cap that resembles an oyster. Found in temperate and tropical forests worldwide, they typically grow in shelf-like clusters on dead or dying deciduous trees	169	100	gm	t	t	2025-09-01 23:21:01.549	2025-09-18 21:31:00.829	{"previews": ["/images/products/oyster_sticker.png", "/images/products/oyster_package.png", "/images/products/oyster.png"], "thumbnails": ["/images/products/oyster_sticker.png", "/images/products/oyster_package.png", "/images/products/oyster.png"]}	[{"label": "Product Name", "value": "Organic Oyster Mushroom Powder (or Fresh/Dried)"}, {"label": "Botanical Name", "value": "Pleurotus ostreatus"}, {"label": "Common Names", "value": "Oyster Mushroom, Pearl Oyster Mushroom, Dhingri (in India)"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fresh: Fan-shaped, white to greyish-brown. Powder: Light beige to tan."}, {"label": "Taste", "value": "Mild, savory, subtly sweet with a velvety texture"}, {"label": "Odor", "value": "Delicate, earthy aroma, sometimes with a faint hint of anise"}]	["<strong>Sautéing</strong>: This is one of the most popular and quickest ways to cook oyster mushrooms. Heat a pan with a little oil or butter over medium-high heat. Add the mushrooms in a single layer and cook for 5-7 minutes, stirring occasionally, until they are golden brown and slightly crispy. Season with salt, pepper, garlic, and herbs for enhanced flavor.", "<strong>Roasting</strong>: Roasting oyster mushrooms in the oven brings out their natural sweetness and gives them a meatier texture. Toss the mushrooms with olive oil, salt, and your favorite seasonings. Spread them in a single layer on a baking sheet and roast at 200°C (400°F) for 15-20 minutes, or until they are browned and crispy.", "<strong>Grilling</strong>: Grilling imparts a smoky flavor to oyster mushrooms. Thread them onto skewers, brush with a marinade of your choice, and grill over medium heat for 5-7 minutes on each side, until they are tender and have grill marks.", "<strong>Simmering in Soups and Stews</strong>: Oyster mushrooms are a great addition to soups, stews, and broths. Their ability to absorb flavors makes them a delicious and textural component. Add them to your pot during the last 15-20 minutes of cooking.", "<strong>Stir-frying</strong>: Their quick cooking time makes oyster mushrooms ideal for stir-fries. Add them to your wok with other vegetables and your favorite stir-fry sauce for a delicious and healthy meal.", "<strong>Breading and Frying</strong>: For a crispy and indulgent treat, oyster mushrooms can be breaded and deep-fried or air-fried. This method gives them a texture similar to fried chicken or calamari."]	["<strong>Appearance</strong>: Oyster mushrooms have a distinctive fan- or oyster-shaped cap that can range in color from pale grey and white to tan, and even pink or yellow, depending on the species. The cap is typically 5 to 25 centimeters in diameter. Their gills are white to cream-colored and run down a short, often stubby, and sometimes nonexistent stem. The flesh is firm, thick, and white.", "<strong>Species</strong>: There are several species of oyster mushrooms, with the most common being Pleurotus ostreatus (the pearl oyster mushroom). Other popular varieties include the king oyster mushroom (Pleurotus eryngii), which is prized for its thick, meaty stem, the golden oyster mushroom (Pleurotus citrinopileatus), and the pink oyster mushroom (Pleurotus djamor).", "<strong>Flavor and Aroma</strong>: Oyster mushrooms have a mild and subtle flavor with hints of earthiness and a slight sweetness. Some describe the aroma as faintly reminiscent of anise. Their delicate taste allows them to absorb the flavors of the dishes they are cooked in.", "<strong>Nutritional Value</strong>: These mushrooms are a good source of protein, fiber, B vitamins (especially niacin and riboflavin), potassium, and antioxidants. They are low in calories and fat."]	"{\\"immuneSupport\\":\\"Boosts immune system function and helps fight off infections\\",\\"energyBoost\\":\\"Provides natural energy enhancement and reduces fatigue\\",\\"stressRelief\\":\\"Helps manage stress and promotes mental well-being\\",\\"antiInflammatory\\":\\"Contains anti-inflammatory properties that support joint health\\",\\"antioxidant\\":\\"Rich in antioxidants that protect cells from damage\\"}"
\.


--
-- Data for Name: promotional_banners; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.promotional_banners (id, title, subtitle, description, discount, "buttonText", "buttonLink", "productId", "categoryId", "imageUrl", "bgColor", "textColor", "isActive", "startDate", "endDate", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: recently_viewed; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.recently_viewed (id, "createdAt", "updatedAt", "userId", "productId") FROM stdin;
cmfpvqsy60001uurquwselsbg	2025-09-18 20:45:18.222	2025-09-18 21:54:58.339	cmfo7ahv3000duul6mieflz7b	2
cmfpwnoug000buu4hl5jkbulk	2025-09-18 21:10:52.553	2025-09-18 21:42:18.062	cmfo7ahv3000duul6mieflz7b	5
cmfpvr1fc0003uurq2sdh4ijb	2025-09-18 20:45:29.209	2025-09-18 21:51:29.564	cmfo7ahv3000duul6mieflz7b	3
cmfpwl26w000luuwnfyzm26ji	2025-09-18 21:08:49.88	2025-09-18 21:53:14.94	cmfo7ahv3000duul6mieflz7b	4
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.reviews (id, rating, "createdAt", "updatedAt", "productId", "userId", comment) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: training_programs; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.training_programs (id, name, slug, description, price, duration, "dailyHours", type, "isActive", "createdAt", "updatedAt") FROM stdin;
1	Oyster Mushroom Training	oyster-mushroom-training	dsfsadfasfldsakjf	5000	10	5-6 Hours	OYSTER	t	2025-09-13 11:47:07.529	2025-09-15 08:41:25.083
\.


--
-- Data for Name: training_registrations; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.training_registrations (id, "registrationNumber", status, "participantName", "participantEmail", "participantPhone", "participantAddress", "preferredStartDate", "specialRequirements", "totalAmount", "createdAt", "updatedAt", "trainingProgramId", "userId", "paymentDate", "paymentMethod", "paymentReference", "paymentStatus", "upiTransactionId") FROM stdin;
\.


--
-- Data for Name: training_schedules; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.training_schedules (id, "trainingProgramId", "dayNumber", date, title, description, topics, "practicalSessions", "theoreticalSessions", "learningObjectives", materials, "startTime", "endTime", "isActive", "createdAt", "updatedAt", "instructorId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.users (id, email, name, "createdAt", "updatedAt", address, "emailVerified", image, phone, role, password, "resetToken", "resetTokenExpiry") FROM stdin;
cmfo7ahv3000duul6mieflz7b	katarianiteshsingh@gmail.com	Nitesh Singh Kataria	2025-09-17 16:33:00.399	2025-09-17 16:33:00.399	\N	2025-09-17 16:33:00.398	\N	\N	ADMIN	$2b$12$qhSHWWejK7OXQBDrst0Pae1z4opZpGDpre./xzkdCi46sHv5k/fEu	\N	\N
\.


--
-- Data for Name: verificationtokens; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.verificationtokens (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: kataria
--

COPY public.wishlist_items (id, "createdAt", "userId", "productId") FROM stdin;
\.


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- Name: instructors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.instructors_id_seq', 2, true);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 4, true);


--
-- Name: product_discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.product_discounts_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: promotional_banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.promotional_banners_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: training_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.training_programs_id_seq', 1, true);


--
-- Name: training_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kataria
--

SELECT pg_catalog.setval('public.training_schedules_id_seq', 1, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_discounts product_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_discounts
    ADD CONSTRAINT product_discounts_pkey PRIMARY KEY (id);


--
-- Name: product_notifications product_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_notifications
    ADD CONSTRAINT product_notifications_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: promotional_banners promotional_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.promotional_banners
    ADD CONSTRAINT promotional_banners_pkey PRIMARY KEY (id);


--
-- Name: recently_viewed recently_viewed_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT recently_viewed_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: training_programs training_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);


--
-- Name: training_registrations training_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT training_registrations_pkey PRIMARY KEY (id);


--
-- Name: training_schedules training_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_schedules
    ADD CONSTRAINT training_schedules_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: categories_title_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX categories_title_key ON public.categories USING btree (title);


--
-- Name: instructors_email_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX instructors_email_key ON public.instructors USING btree (email);


--
-- Name: instructors_name_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX instructors_name_key ON public.instructors USING btree (name);


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: product_categories_productId_categoryId_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "product_categories_productId_categoryId_key" ON public.product_categories USING btree ("productId", "categoryId");


--
-- Name: product_notifications_email_productId_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "product_notifications_email_productId_key" ON public.product_notifications USING btree (email, "productId");


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: recently_viewed_userId_productId_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "recently_viewed_userId_productId_key" ON public.recently_viewed USING btree ("userId", "productId");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: training_programs_name_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX training_programs_name_key ON public.training_programs USING btree (name);


--
-- Name: training_programs_slug_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX training_programs_slug_key ON public.training_programs USING btree (slug);


--
-- Name: training_registrations_registrationNumber_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "training_registrations_registrationNumber_key" ON public.training_registrations USING btree ("registrationNumber");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verificationtokens_identifier_token_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX verificationtokens_identifier_token_key ON public.verificationtokens USING btree (identifier, token);


--
-- Name: verificationtokens_token_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX verificationtokens_token_key ON public.verificationtokens USING btree (token);


--
-- Name: wishlist_items_userId_productId_key; Type: INDEX; Schema: public; Owner: kataria
--

CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON public.wishlist_items USING btree ("userId", "productId");


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_categories product_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_categories product_categories_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_discounts product_discounts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_discounts
    ADD CONSTRAINT "product_discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_notifications product_notifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.product_notifications
    ADD CONSTRAINT "product_notifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotional_banners promotional_banners_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.promotional_banners
    ADD CONSTRAINT "promotional_banners_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: promotional_banners promotional_banners_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.promotional_banners
    ADD CONSTRAINT "promotional_banners_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recently_viewed recently_viewed_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT "recently_viewed_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recently_viewed recently_viewed_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT "recently_viewed_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_registrations training_registrations_trainingProgramId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT "training_registrations_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES public.training_programs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_registrations training_registrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT "training_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: training_schedules training_schedules_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_schedules
    ADD CONSTRAINT "training_schedules_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: training_schedules training_schedules_trainingProgramId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.training_schedules
    ADD CONSTRAINT "training_schedules_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES public.training_programs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kataria
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: kataria
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict vyTF7XDslyqQD1MAkzbeE1fTTcTRRUN0KmEgdNUo3uU05YsGdriVHUvbjUXnojC

