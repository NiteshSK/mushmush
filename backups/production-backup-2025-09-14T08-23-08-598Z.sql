--
-- PostgreSQL database dump
--

\restrict 8sgLRixTQkrUGbvEuKTMe4FzPxZQRqBMY55yaYh65eR0pwrU2Q98V5UhDZOJOCj

-- Dumped from database version 17.2
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: prisma_migration
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO prisma_migration;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: prisma_migration
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO prisma_migration;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO prisma_migration;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO prisma_migration;

--
-- Name: RegistrationStatus; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."RegistrationStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."RegistrationStatus" OWNER TO prisma_migration;

--
-- Name: TrainingType; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."TrainingType" AS ENUM (
    'OYSTER',
    'BUTTON',
    'SHIITAKE',
    'GANODERMA'
);


ALTER TYPE public."TrainingType" OWNER TO prisma_migration;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: prisma_migration
--

CREATE TYPE public."UserRole" AS ENUM (
    'CUSTOMER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO prisma_migration;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public._prisma_migrations OWNER TO prisma_migration;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.accounts OWNER TO prisma_migration;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.blog_posts OWNER TO prisma_migration;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO prisma_migration;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.categories OWNER TO prisma_migration;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO prisma_migration;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    "orderId" text NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO prisma_migration;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.orders OWNER TO prisma_migration;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "categoryId" integer NOT NULL
);


ALTER TABLE public.product_categories OWNER TO prisma_migration;

--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_categories_id_seq OWNER TO prisma_migration;

--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: product_discounts; Type: TABLE; Schema: public; Owner: prisma_migration
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
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_discounts OWNER TO prisma_migration;

--
-- Name: product_discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.product_discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_discounts_id_seq OWNER TO prisma_migration;

--
-- Name: product_discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.product_discounts_id_seq OWNED BY public.product_discounts.id;


--
-- Name: product_notifications; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.product_notifications (
    id text NOT NULL,
    email text NOT NULL,
    "productId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_notifications OWNER TO prisma_migration;

--
-- Name: products; Type: TABLE; Schema: public; Owner: prisma_migration
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
    "additionalInfo" jsonb NOT NULL
);


ALTER TABLE public.products OWNER TO prisma_migration;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO prisma_migration;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: promotional_banners; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.promotional_banners OWNER TO prisma_migration;

--
-- Name: promotional_banners_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.promotional_banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotional_banners_id_seq OWNER TO prisma_migration;

--
-- Name: promotional_banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.promotional_banners_id_seq OWNED BY public.promotional_banners.id;


--
-- Name: recently_viewed; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.recently_viewed (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public.recently_viewed OWNER TO prisma_migration;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.reviews OWNER TO prisma_migration;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO prisma_migration;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO prisma_migration;

--
-- Name: training_programs; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.training_programs OWNER TO prisma_migration;

--
-- Name: training_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.training_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_programs_id_seq OWNER TO prisma_migration;

--
-- Name: training_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.training_programs_id_seq OWNED BY public.training_programs.id;


--
-- Name: training_registrations; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.training_registrations OWNER TO prisma_migration;

--
-- Name: users; Type: TABLE; Schema: public; Owner: prisma_migration
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


ALTER TABLE public.users OWNER TO prisma_migration;

--
-- Name: verificationtokens; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.verificationtokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verificationtokens OWNER TO prisma_migration;

--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO prisma_migration;

--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: product_discounts id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_discounts ALTER COLUMN id SET DEFAULT nextval('public.product_discounts_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: promotional_banners id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.promotional_banners ALTER COLUMN id SET DEFAULT nextval('public.promotional_banners_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: training_programs id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.training_programs ALTER COLUMN id SET DEFAULT nextval('public.training_programs_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0dfff5a7-ae0c-4af5-957d-894abd1aeddc	27165e6a591b55e679f3e4bd2064034abce10814712ba6864c99ff255afd16ea	2025-09-14 06:51:48.680599+00	20250913172210_fix_category_paths	Manually resolved - category paths fixed in migration 20250914064133_fix_production_category_paths_conflict	\N	2025-09-13 17:30:33.32641+00	0
75ec6084-f153-4991-a197-fcd439952d34	275c524d76867a761df7bb070b442c9b3aee6111a0f51dbafb44f7e27a32185a	2025-09-02 04:29:36.231156+00	20250902033850_init	\N	\N	2025-09-02 04:29:34.447546+00	1
c85aee3c-6230-4256-b2f1-0ab047e4b1aa	0a22f9dcc2a2baaa18e20647b5062c34fd45c267febc55824f39241a29361798	2025-09-02 10:41:00.206774+00	20250902103501_add_comment_to_review	\N	\N	2025-09-02 10:41:00.09382+00	1
b9afb2a9-4810-4e67-8b91-562ee5ebca69	d807ef212c90beb23421ad024099d4e7409f8a4c3a8a62a0269946c99eb8d29a	\N	20250913131615_add_promotional_banners	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250913131615_add_promotional_banners\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: type "DiscountType" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \\"DiscountType\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1177), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250913131615_add_promotional_banners"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250913131615_add_promotional_banners"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:236	2025-09-13 14:44:09.138406+00	2025-09-13 14:01:14.889379+00	0
5fc8e68f-bc2a-4b25-8ee8-920fbd23a3be	d807ef212c90beb23421ad024099d4e7409f8a4c3a8a62a0269946c99eb8d29a	2025-09-13 14:44:09.778705+00	20250913131615_add_promotional_banners		\N	2025-09-13 14:44:09.778705+00	0
e961f6e6-2e8d-444e-b7ad-8d1e4d3cf13a	47c1ba38d7f0b9f0024568ad4b5d7de53b89653daed9d87a8576ba1a5a66a8e4	2025-09-14 06:52:10.072501+00	20250914064133_fix_production_category_paths_conflict	\N	\N	2025-09-14 06:52:08.365126+00	1
74c7b6fe-f832-42b0-b5bc-531125eadb5c	03285a02dbe19f15a567afe0cdcfae294c4121b371338564f9ddf817c2f12b18	2025-09-13 14:44:31.331443+00	20250913142210_fix_promotional_banners_production	\N	\N	2025-09-13 14:44:29.611064+00	1
6fdbe921-b2ea-4f96-b937-7a8d551f4246	24aaf3c07733c916adad77bcb118e7c07ee7865f05693eaf9c4b40aaf4c5bbcf	2025-09-13 16:27:20.384232+00	20250913160802_add_training_programs	\N	\N	2025-09-13 16:27:20.313391+00	1
d74a49f6-e7af-430b-af9a-4c8f396e50df	333266f0127be6ae98e9ceca500db9ed1951ba34c5779b340bb0c04aa7cc69bf	2025-09-13 16:39:21.155843+00	20250913163153_add_payment_fields_to_training_registration	\N	\N	2025-09-13 16:39:21.089522+00	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.blog_posts (id, title, slug, content, excerpt, img, views, published, "createdAt", "updatedAt", "metaTitle", "metaDescription") FROM stdin;
1	From Spore to Plate: The Ultimate Guide to Growing Oyster Mushrooms at Home	growing-oyster-mushrooms-guide	Complete guide content here...	Learn how to grow delicious oyster mushrooms at home with this comprehensive guide.	/images/blog/oyster-blog-01.png	100000	t	2025-09-02 04:51:23.347	2025-09-02 04:51:23.347	How to Grow Oyster Mushrooms at Home - Complete Guide	Step-by-step guide to growing oyster mushrooms at home. Learn about spawn, growing conditions, and harvesting techniques.
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.categories (id, title, slug, img, path, description, "createdAt", "updatedAt") FROM stdin;
2	Tinctures	tinctures	/images/categories/generic_tincture.png	/shop?category=tinctures	Concentrated mushroom tinctures and extracts	2025-09-02 04:50:49.677	2025-09-14 08:21:52.654
1	Edible	edible	/images/categories/edible_mushrooms.png	/shop?category=edible	Fresh edible mushrooms for culinary use	2025-09-02 04:50:49.677	2025-09-14 08:21:52.654
3	Medicinal	medicinal	/images/categories/medicinal_mushrooms.png	/shop?category=medicinal	Medicinal mushrooms for health and wellness	2025-09-02 04:50:49.677	2025-09-14 08:21:52.654
4	Dry Powder	powders	/images/categories/powders.png	/shop?category=powders	Dried mushroom powders and supplements	2025-09-02 04:50:49.677	2025-09-14 08:21:52.654
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.order_items (id, quantity, price, "orderId", "productId") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.orders (id, "orderNumber", status, total, subtotal, tax, shipping, "createdAt", "updatedAt", "customerName", "customerEmail", "customerPhone", "shippingAddress", "userId") FROM stdin;
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.product_categories (id, "productId", "categoryId") FROM stdin;
1	1	3
2	1	4
3	2	1
4	3	1
5	4	1
6	4	3
7	5	1
8	5	3
9	6	2
10	6	3
\.


--
-- Data for Name: product_discounts; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.product_discounts (id, "productId", type, value, "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
2	3	PERCENTAGE	5	2025-09-02 15:35:41.795	2026-09-02 15:36:13.239	t	2025-09-02 15:35:41.796	2025-09-02 15:36:15.477
4	6	PERCENTAGE	3	2025-09-02 00:00:00	2025-09-05 00:00:00	t	2025-09-02 17:55:15.755	2025-09-02 17:55:15.755
3	5	PERCENTAGE	4	2025-09-02 00:00:00	2025-10-02 00:00:00	t	2025-09-02 15:35:42.124	2025-09-03 15:34:38.886
1	2	PERCENTAGE	3	2025-09-02 00:00:00	2026-09-02 00:00:00	t	2025-09-02 15:35:41.134	2025-09-13 17:05:10.381
\.


--
-- Data for Name: product_notifications; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.product_notifications (id, email, "productId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.products (id, title, slug, description, price, "measurementValue", "measurementType", "inStock", featured, "createdAt", "updatedAt", imgs, specifications, "howToConsume", "additionalInfo") FROM stdin;
1	Ganoderma lucidum	ganoderma-lucidum	Our <strong>Ganoderma lucidum</strong>, commonly known as Reishi or Lingzhi, is cultivated and processed under the strictest quality standards to deliver a product of exceptional purity and potency. Revered for centuries in traditional medicine as the "Mushroom of Immortality," our Reishi extract is designed to support modern wellness goals.	999	100	gm	f	t	2025-09-02 04:50:54.486	2025-09-02 17:13:57.342	{"previews": ["/images/products/ganoderma_sticker.png", "/images/products/ganoderma_package.png", "/images/products/ganoderma_specs.png", "/images/products/ganoderma.png"], "thumbnails": ["/images/products/ganoderma_sticker.png", "/images/products/ganoderma_package.png", "/images/products/ganoderma_specs.png", "/images/products/ganoderma.png"]}	["<strong>Extraction Method:</strong> Advanced Dual-Extraction (temperature-controlled hot water and alcohol) to ensure the bioavailability of both water-soluble and alcohol-soluble compounds like triterpenes.", "<strong>Extraction Ratio:</strong> A potent 10:1 extract ratio, meaning 10kg of raw mushroom is used to produce 1kg of extract powder.", "<strong>Drying Method:</strong> Spray-dried to preserve the integrity and potency of the active compounds.", "<strong>Polysaccharides:</strong> ≥ 30%", "<strong>Beta-Glucans:</strong> ≥ 20%", "<strong>Triterpenes:</strong> ≥ 4%"]	["<strong>As a Simple Tea</strong>: Mix about half a teaspoon of Ganoderma powder in a cup of hot water. Add honey, jaggery, or a squeeze of lemon to balance the natural bitterness.", "<strong>Stir into Coffee or Chai</strong>: Add a serving of the powder directly to your daily coffee or masala chai. The strong flavours of these beverages effectively mask the mushroom's taste.", "<strong>Blend into Smoothies</strong>: Add the powder to your fruit or vegetable smoothies. The other ingredients will completely hide the taste while you still get all the benefits.", "<strong>Add to Soups and Food</strong>: Stir the powder into warm soups, dals, or broths. Its earthy, umami flavour can enhance the taste of savoury dishes.", "<strong>Take as Capsules</strong>: For the most convenient and taste-free option, take Ganoderma in capsule form and swallow with water as per the dosage instructions.", "<strong>Brew from Dried Slices</strong>: If you have whole dried Reishi, simmer a few pieces in water for at least one hour to create a traditional, potent health tonic."]	[{"label": "Product Name", "value": "Organic Reishi Mushroom Powder (or Extract)"}, {"label": "Botanical Name", "value": "Ganoderma lucidum"}, {"label": "Common Names", "value": "Reishi, Lingzhi"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fine, reddish-brown powder"}, {"label": "Taste", "value": "Characteristically bitter"}, {"label": "Odor", "value": "Mild, earthy aroma"}]
3	Chantrelle	chantrelle	Chanterelle <i>(Cantharellus cibarius)</i> is a celebrated wild mushroom, famous for its beautiful golden color, delicate texture, and a subtle, fruity aroma reminiscent of apricots. Unlike cultivated mushrooms, chanterelles are foraged from forests, growing in symbiotic relationships with trees. They are a true gourmet delicacy, sought after by chefs and food lovers around the world.	699	100	gm	t	f	2025-09-02 04:51:04.837	2025-09-02 16:14:36.21	{"previews": ["/images/products/chantrelle_sticker.png", "/images/products/chantrelle_package.png", "/images/products/chantrelle.png"], "thumbnails": ["/images/products/chantrelle_sticker.png", "/images/products/chantrelle_package.png", "/images/products/chantrelle.png"]}	["<strong>Appearance</strong>: Chanterelles are typically trumpet or funnel-shaped, with a wavy, irregular cap. Their color ranges from a vibrant yellow to a deep golden-orange. Instead of true gills, they have distinctive blunt, forked ridges that run down the stem.", "<strong>Flavor and Aroma</strong>: They have a unique and complex flavor that is both peppery and fruity, with distinct notes of apricot or peach. The texture is wonderfully chewy and firm, yet tender when cooked.", "<strong>Nutritional Value</strong>: Chanterelles are a great source of vitamins D and B, particularly niacin and riboflavin. They also provide essential minerals like iron and potassium, and are rich in polysaccharides, which are known for their immune-supporting properties."]	["<strong>Simple Sauté</strong>: This is the best way to enjoy their unique flavor. Sauté them in butter or olive oil with a little garlic and fresh thyme or parsley. Their flavor is delicate, so they don't need much.", "<strong>Creamy Sauces</strong>: Chanterelles are famously used in creamy pasta sauces or served over steak or chicken. Their firm texture holds up beautifully in rich sauces.", "<strong>Soups and Risottos</strong>: Add them to risottos or creamy soups to impart a luxurious, earthy, and fruity flavor.", "<strong>Preserving</strong>: Chanterelles don't rehydrate well from a fully dried state. The best way to preserve them is to sauté them first and then freeze them in an airtight container."]	[{"label": "Product Name", "value": "Wild Foraged Chanterelle Mushrooms (Fresh)"}, {"label": "Botanical Name", "value": "Cantharellus cibarius"}, {"label": "Common Names", "value": "Chanterelle, Golden Chanterelle, Girolle"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fresh: Golden-orange, trumpet-shaped with forked ridges."}, {"label": "Taste", "value": "Delicate, peppery, and fruity with notes of apricot"}, {"label": "Odor", "value": "Distinctive fruity aroma, often compared to apricots"}]
2	Oyster Mushroom	oyster-mushroom	<strong>Oyster mushrooms</strong>, scientifically known as <strong>Pleurotus</strong>, are a popular and versatile variety of edible fungi cherished for their delicate flavor and velvety texture. Their name is derived from their characteristic shell-like appearance, with a cap that resembles an oyster. Found in temperate and tropical forests worldwide, they typically grow in shelf-like clusters on dead or dying deciduous trees	119	100	gm	t	t	2025-09-02 04:51:01.549	2025-09-13 17:04:31.424	{"previews": ["/images/products/oyster_sticker.png", "/images/products/oyster_package.png", "/images/products/oyster.png"], "thumbnails": ["/images/products/oyster_sticker.png", "/images/products/oyster_package.png", "/images/products/oyster.png"]}	["<strong>Appearance</strong>: Oyster mushrooms have a distinctive fan- or oyster-shaped cap that can range in color from pale grey and white to tan, and even pink or yellow, depending on the species. The cap is typically 5 to 25 centimeters in diameter. Their gills are white to cream-colored and run down a short, often stubby, and sometimes nonexistent stem. The flesh is firm, thick, and white.", "<strong>Species</strong>: There are several species of oyster mushrooms, with the most common being Pleurotus ostreatus (the pearl oyster mushroom). Other popular varieties include the king oyster mushroom (Pleurotus eryngii), which is prized for its thick, meaty stem, the golden oyster mushroom (Pleurotus citrinopileatus), and the pink oyster mushroom (Pleurotus djamor).", "<strong>Flavor and Aroma</strong>: Oyster mushrooms have a mild and subtle flavor with hints of earthiness and a slight sweetness. Some describe the aroma as faintly reminiscent of anise. Their delicate taste allows them to absorb the flavors of the dishes they are cooked in.", "<strong>Nutritional Value</strong>: These mushrooms are a good source of protein, fiber, B vitamins (especially niacin and riboflavin), potassium, and antioxidants. They are low in calories and fat."]	["<strong>Sautéing</strong>: This is one of the most popular and quickest ways to cook oyster mushrooms. Heat a pan with a little oil or butter over medium-high heat. Add the mushrooms in a single layer and cook for 5-7 minutes, stirring occasionally, until they are golden brown and slightly crispy. Season with salt, pepper, garlic, and herbs for enhanced flavor.", "<strong>Roasting</strong>: Roasting oyster mushrooms in the oven brings out their natural sweetness and gives them a meatier texture. Toss the mushrooms with olive oil, salt, and your favorite seasonings. Spread them in a single layer on a baking sheet and roast at 200°C (400°F) for 15-20 minutes, or until they are browned and crispy.", "<strong>Grilling</strong>: Grilling imparts a smoky flavor to oyster mushrooms. Thread them onto skewers, brush with a marinade of your choice, and grill over medium heat for 5-7 minutes on each side, until they are tender and have grill marks.", "<strong>Simmering in Soups and Stews</strong>: Oyster mushrooms are a great addition to soups, stews, and broths. Their ability to absorb flavors makes them a delicious and textural component. Add them to your pot during the last 15-20 minutes of cooking.", "<strong>Stir-frying</strong>: Their quick cooking time makes oyster mushrooms ideal for stir-fries. Add them to your wok with other vegetables and your favorite stir-fry sauce for a delicious and healthy meal.", "<strong>Breading and Frying</strong>: For a crispy and indulgent treat, oyster mushrooms can be breaded and deep-fried or air-fried. This method gives them a texture similar to fried chicken or calamari."]	[{"label": "Product Name", "value": "Organic Oyster Mushroom Powder (or Fresh/Dried)"}, {"label": "Botanical Name", "value": "Pleurotus ostreatus"}, {"label": "Common Names", "value": "Oyster Mushroom, Pearl Oyster Mushroom, Dhingri (in India)"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fresh: Fan-shaped, white to greyish-brown. Powder: Light beige to tan."}, {"label": "Taste", "value": "Mild, savory, subtly sweet with a velvety texture"}, {"label": "Odor", "value": "Delicate, earthy aroma, sometimes with a faint hint of anise"}]
5	Lion's Mane	lions-mane	Lion's Mane (Hericium erinaceus), also known as the "pom-pom mushroom," is a unique and increasingly popular edible and medicinal fungus. Its striking appearance and remarkable health benefits have garnered significant attention in both culinary and wellness circles. Native to North America, Europe, and Asia, this mushroom typically grows on dead or dying hardwood trees, particularly oak and beech.	1599	100	gm	t	f	2025-09-02 04:51:13.542	2025-09-02 17:13:52.414	{"previews": ["/images/products/lions_mane.png"], "thumbnails": ["/images/products/lions_mane.png"]}	["<strong>Appearance</strong>: Lion's Mane is easily identifiable by its shaggy, icicle-like spines that cascade downwards, resembling a lion's mane or a frozen waterfall. Unlike traditional mushrooms with caps and gills, it has a single, clump-like structure that is white to off-white in color. As it matures, the tips of the spines may turn a slightly brownish hue. The texture is soft, spongy, and somewhat stringy, often compared to seafood like crab or lobster.", "<strong>Flavor and Aroma</strong>: When cooked, Lion's Mane has a mild, savory flavor that is often described as seafood-like, with a subtle sweetness. Its aroma is delicate and earthy. The texture is tender and chewy, which makes it a popular meat substitute in vegetarian and vegan dishes.", "<strong>Nutritional Value</strong>: This mushroom is a good source of protein, fiber, potassium, and various antioxidants. It is low in calories and fat. What truly sets Lion's Mane apart are its unique bioactive compounds, including hericenones and erinacines, which are believed to be responsible for its cognitive-enhancing properties."]	["<strong>Sautéing</strong>: This is one of the most popular and straightforward ways to prepare Lion's Mane. Heat a pan with a bit of butter or oil over medium heat. Add the sliced or torn mushroom and cook for about 5-7 minutes on each side, until it's golden brown and slightly crispy. Season with salt, pepper, garlic, and fresh herbs like thyme or parsley.", "<strong>Roasting</strong>: Roasting enhances the mushroom's natural sweetness and gives it a meatier texture. Toss the mushroom pieces with olive oil and your favorite seasonings. Spread them on a baking sheet and roast at 200°C (400°F) for 15-20 minutes, or until the edges are crispy.", "<strong>Crab Cakes</strong>: Due to its crab-like texture, Lion's Mane is an excellent ingredient for vegan or vegetarian \\"crab\\" cakes. Shred the mushroom, mix it with breadcrumbs, mayonnaise (or a vegan alternative), and seasonings, then form into patties and pan-fry until golden.", "<strong>Soups and Stews</strong>: Add chunks of Lion's Mane to soups and stews to impart a savory depth of flavor and a satisfying, meaty texture. It absorbs the surrounding flavors well.", "<strong>Sandwiches and Tacos</strong>: Sautéed or roasted Lion's Mane makes a delicious and hearty filling for sandwiches, tacos, and wraps. It's often used as a substitute for pulled pork or shredded chicken.", "<i>Medicinal Consumption: Beyond its culinary uses, Lion's Mane is widely consumed for its potential health benefits, particularly for cognitive function. For this purpose, it is available in various forms:</i>", "<strong>Supplements</strong>: Capsules, powders, and tinctures are popular ways to consume Lion's Mane for its medicinal properties. These can be found at health food stores and online.", "<strong>Mushroom Coffee and Tea</strong>: Lion's Mane powder is often added to coffee, tea, and other beverages for a daily cognitive boost."]	[{"label": "Product Name", "value": "Organic Lion's Mane Mushroom Powder (or Fresh/Dried)"}, {"label": "Botanical Name", "value": "Hericium erinaceus"}, {"label": "Common Names", "value": "Lion's Mane, Pom Pom Mushroom, Yamabushitake"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fresh: White, cascading, icicle-like spines. Powder: Creamy white to light beige."}, {"label": "Taste", "value": "Savory and mild, with a texture and flavor reminiscent of crab or lobster"}, {"label": "Odor", "value": "Subtle, earthy, and slightly sweet"}]
6	Ganoderma's Tincture	ganoderma-tincture	Ganoderma Tincture, derived from the revered <i>Ganoderma lucidum</i> mushroom, is a potent liquid extract designed for modern wellness. Known for centuries in traditional medicine as 'Reishi' or the 'Mushroom of Immortality,' this tincture concentrates the mushroom's powerful adaptogenic properties. It's crafted to support stress management, enhance immune function, and promote overall vitality, making it a cornerstone for any natural health regimen.	1699	10	ml	f	f	2025-09-02 04:51:18.449	2025-09-03 06:42:39.691	{"previews": ["/images/products/ganoderma_tincture_sticker.png"], "thumbnails": ["/images/products/ganoderma_tincture_sticker.png"]}	["<strong>Appearance</strong>: The tincture is a rich, dark-brown liquid. It is derived from the Ganoderma mushroom, which is known for its glossy, reddish-brown, kidney-shaped cap and woody texture.", "<strong>Flavor and Aroma</strong>: Ganoderma is famous for its distinctly bitter and woody taste, a sign of its potent compounds. The aroma is deep and earthy, reflecting its natural forest origins.", "<strong>Active Compounds</strong>: This tincture is a concentrated source of Ganoderma's key bioactive compounds, primarily triterpenoids and polysaccharides (like beta-glucans). These are studied for their significant roles in supporting the immune system and helping the body adapt to stress."]	["<strong>Sublingual (Under the Tongue)</strong>: For fastest absorption, place a full dropper (approximately 1ml) directly under your tongue and hold it for 60-90 seconds before swallowing.", "<strong>Add to Beverages</strong>: Easily mix a dropperful into your morning coffee, tea, smoothie, or even a glass of water. The potent flavor is often best diluted in a drink.", "<strong>Consistent Daily Use</strong>: For best results, take 1-2 droppers daily. As an adaptogen, Ganoderma's benefits are most pronounced with consistent, long-term use.", "<strong>Evening Routine</strong>: Many users prefer taking Ganoderma tincture in the evening to help promote relaxation and support a restful night's sleep."]	[{"label": "Product Name", "value": "Organic Ganoderma Tincture (Reishi Extract)"}, {"label": "Botanical Name", "value": "Ganoderma lucidum"}, {"label": "Common Names", "value": "Reishi, Lingzhi, Mushroom of Immortality"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Dark, rich brown liquid extract"}, {"label": "Taste", "value": "Characteristically bitter and earthy"}, {"label": "Odor", "value": "Mild, woody, and earthy aroma"}]
4	Shitake	shitake	Shiitake <i>(Lentinula edodes)</i> is one of the most popular and cultivated mushrooms worldwide, prized for its rich, savory taste and significant health benefits. Native to East Asia, it grows on decaying hardwood trees and has been a staple in Asian cuisine and traditional medicine for centuries. Its deep, umami flavor makes it a culinary cornerstone in many dishes.	599	100	gm	t	f	2025-09-02 04:51:08.218	2025-09-13 17:04:04.83	{"previews": ["/images/products/shitake_sticker.png", "/images/products/shitake_package.png", "/images/products/shitake_package_2.png", "/images/products/shitake_on_log.png", "/images/products/shitake.png"], "thumbnails": ["/images/products/shitake_sticker.png", "/images/products/shitake_package.png", "/images/products/shitake_package_2.png", "/images/products/shitake_on_log.png", "/images/products/shitake.png"]}	["<strong>Appearance</strong>: Shiitake mushrooms have a distinct umbrella-shaped cap, typically ranging from 5 to 10 centimeters in diameter. The cap is light to dark brown, often with a slightly cracked or scaly texture on the surface. The gills underneath are white to light brown, and the stem is tough, fibrous, and usually removed before cooking.", "<strong>Flavor and Aroma</strong>: Shiitakes are renowned for their potent umami (savory) flavor, which is rich, smoky, and earthy. The aroma is equally robust and distinctive. When cooked, they develop a dense, meaty texture that is satisfyingly chewy.", "<strong>Nutritional Value</strong>: These mushrooms are an excellent source of B vitamins (especially pantothenic acid and B6), copper, selenium, manganese, and zinc. They are also rich in polysaccharides like lentinan and other unique bioactive compounds, which are studied for their immune-boosting and cholesterol-lowering properties."]	["<strong>Sautéing and Stir-frying</strong>: This is a classic method that intensifies their flavor. Slice the caps and sauté in oil or butter with garlic and soy sauce. Their robust texture holds up well in stir-fries with other vegetables and proteins.", "<strong>Roasting</strong>: Roasting shiitakes brings out a deeper, more concentrated savory flavor. Toss whole or halved caps with oil and seasonings and roast at 200°C (400°F) for 15-20 minutes until the edges are caramelized and crispy.", "<strong>Soups and Broths</strong>: Shiitakes are essential for adding a deep, savory foundation to soups and broths, like Japanese miso soup or dashi stock. Both fresh and rehydrated dried mushrooms can be used.", "<strong>Grilling</strong>: Thread whole shiitake caps onto skewers, marinate them in a savory glaze (like teriyaki), and grill until tender and slightly charred. The tough stems can be used to flavor stocks and broths.", "<strong>Using Dried Shiitakes</strong>: Dried shiitakes have a more intense flavor than fresh ones. To use, rehydrate them in warm water for 20-30 minutes until soft. The flavorful soaking liquid can be strained and used as a broth in your recipe.", "<i>Medicinal Consumption: For centuries, shiitake has been used in traditional medicine for its health-promoting properties. Today, it is available in concentrated forms for therapeutic use:</i>", "<strong>Supplements</strong>: Shiitake extract is available in capsules, powders, and tinctures, primarily used to support immune function and cardiovascular health."]	[{"label": "Product Name", "value": "Organic Shiitake Mushroom Powder (or Fresh/Dried)"}, {"label": "Botanical Name", "value": "Lentinula edodes"}, {"label": "Common Names", "value": "Shiitake, Forest Mushroom, Oak Mushroom"}, {"label": "Part Used", "value": "100% Fruiting Body"}, {"label": "Appearance", "value": "Fresh: Brown, umbrella-shaped cap with a fibrous stem. Powder: Light to medium brown."}, {"label": "Taste", "value": "Rich, umami, smoky, and earthy with a meaty texture"}, {"label": "Odor", "value": "Distinctive, savory, and earthy aroma"}]
\.


--
-- Data for Name: promotional_banners; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.promotional_banners (id, title, subtitle, description, discount, "buttonText", "buttonLink", "productId", "categoryId", "imageUrl", "bgColor", "textColor", "isActive", "startDate", "endDate", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: recently_viewed; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.recently_viewed (id, "createdAt", "updatedAt", "userId", "productId") FROM stdin;
cmf403vl60003ic04uoqz1s7h	2025-09-03 13:16:30.763	2025-09-03 13:16:30.763	cmf2rtavq0001l504oy7lle1e	1
cmf2s38wi0001l4045u5iwxyf	2025-09-02 16:44:18.258	2025-09-03 13:17:04.582	cmf2rtavq0001l504oy7lle1e	6
cmf3zymzx0001jq05h5myzx9w	2025-09-03 13:12:26.35	2025-09-03 13:17:28.165	cmf2rtavq0001l504oy7lle1e	4
cmf4013zn0005jq05k31bi1r3	2025-09-03 13:14:21.683	2025-09-03 13:17:59.894	cmf2rtavq0001l504oy7lle1e	5
cmf2pr0930001jo04dg3e92kg	2025-09-02 15:38:47.943	2025-09-02 15:38:47.943	cmf2pq9sg0000ld04m1r234gc	5
cmf2qt40y0001jr048ci35nqq	2025-09-02 16:08:25.763	2025-09-02 16:08:25.763	cmf2pq9sg0000ld04m1r234gc	2
cmf2pr8uy0003jo04jhdojb5c	2025-09-02 15:38:59.098	2025-09-02 16:23:25.015	cmf2pq9sg0000ld04m1r234gc	4
cmf403h0q0007jq05j82cu4s6	2025-09-03 13:16:11.882	2025-09-03 13:18:55.469	cmf2rtavq0001l504oy7lle1e	3
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.reviews (id, rating, "createdAt", "updatedAt", "productId", "userId", comment) FROM stdin;
1	5	2025-09-02 11:18:01.498	2025-09-02 11:18:01.498	5	\N	MushMush provides the best mushroom in Dehradun.\nThey are growing this in a very organic way without using any chemical
2	5	2025-09-02 16:45:31.424	2025-09-02 16:45:31.424	6	cmf2rtavq0001l504oy7lle1e	it is good for health buy from mushmush
3	5	2025-09-02 16:48:55.156	2025-09-02 16:48:55.156	6	\N	great product from mushmush
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: training_programs; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.training_programs (id, name, slug, description, price, duration, "dailyHours", type, "isActive", "createdAt", "updatedAt") FROM stdin;
1	Oyster Mushroom Training	oyster-mushroom-training	dsfsadfasfldsakjf	5000	10	5-6 Hours 	OYSTER	f	2025-09-13 17:17:07.529	2025-09-14 07:02:52.881
\.


--
-- Data for Name: training_registrations; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.training_registrations (id, "registrationNumber", status, "participantName", "participantEmail", "participantPhone", "participantAddress", "preferredStartDate", "specialRequirements", "totalAmount", "createdAt", "updatedAt", "trainingProgramId", "userId", "paymentDate", "paymentMethod", "paymentReference", "paymentStatus", "upiTransactionId") FROM stdin;
cmfij5oue0002la04gj68hckd	TR1757783914501471	PENDING	Pravesh rawat	pravesh.rawat340@gmail.com	7417165960	{"city": "dehr", "state": "dfsdf", "street": "dfsghs", "pincode": "248001"}	2025-02-10 00:00:00	fsdgsdfgfds	5000	2025-09-13 17:18:34.503	2025-09-13 17:18:34.503	1	cmfiiwshp0000jx04hy1n4esx	\N	\N	\N	PENDING	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.users (id, email, name, "createdAt", "updatedAt", address, "emailVerified", image, phone, role, password, "resetToken", "resetTokenExpiry") FROM stdin;
cmf2pq9sg0000ld04m1r234gc	katarianiteshsingh@gmail.com	Nitesh Singh Kataria	2025-09-02 15:38:13.648	2025-09-02 15:38:13.648	\N	\N	\N	\N	CUSTOMER	$2b$12$7zmSURw39feSpa6MeuYDQe7gjaH0lVnRUK1NNDTRN3Btul3zaZn1K	\N	\N
cmf2rtavq0001l504oy7lle1e	bharu310194@gmail.com	Bhartendu	2025-09-02 16:36:34.262	2025-09-02 16:45:31.296	\N	2025-09-02 16:36:34.261	\N	\N	ADMIN	$2b$12$z2cPakUnSCwtzv5xGvm/z.dmHkNNxMbZI1VbV9U5ONnZhOWGv..s.	\N	\N
cmf2soauv0000l904irukb91m	vckkumar78@gmail.com	Vikrant	2025-09-02 17:00:40.567	2025-09-02 17:00:40.567	\N	2025-09-02 17:00:40.566	\N	\N	ADMIN	$2b$12$nHB4V5863z2nsd1rAE.Pcu72t.guiILTF/6YEAatxNVua0OEEUPhm	\N	\N
cmfiiwshp0000jx04hy1n4esx	pravesh.rawat340@gmail.com	Pravesh rawat	2025-09-13 17:11:39.326	2025-09-13 17:11:39.326	\N	2025-09-13 17:11:39.325	\N	\N	ADMIN	$2b$12$lQtAjWzZwuI5zvEIIoimtOV3J9d0hYITJR37ESIw3huhj7mD7Bcqa	\N	\N
\.


--
-- Data for Name: verificationtokens; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.verificationtokens (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.wishlist_items (id, "createdAt", "userId", "productId") FROM stdin;
cmf2qtk5b0001jq04p8mh4mhu	2025-09-02 16:08:46.655	cmf2pq9sg0000ld04m1r234gc	3
cmf2rcdhx0003lb04cfxci6zn	2025-09-02 16:23:24.502	cmf2pq9sg0000ld04m1r234gc	4
\.


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 10, true);


--
-- Name: product_discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.product_discounts_id_seq', 4, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- Name: promotional_banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.promotional_banners_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.reviews_id_seq', 3, true);


--
-- Name: training_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.training_programs_id_seq', 1, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_discounts product_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_discounts
    ADD CONSTRAINT product_discounts_pkey PRIMARY KEY (id);


--
-- Name: product_notifications product_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_notifications
    ADD CONSTRAINT product_notifications_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: promotional_banners promotional_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.promotional_banners
    ADD CONSTRAINT promotional_banners_pkey PRIMARY KEY (id);


--
-- Name: recently_viewed recently_viewed_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT recently_viewed_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: training_programs training_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);


--
-- Name: training_registrations training_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT training_registrations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: categories_title_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX categories_title_key ON public.categories USING btree (title);


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: product_categories_productId_categoryId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "product_categories_productId_categoryId_key" ON public.product_categories USING btree ("productId", "categoryId");


--
-- Name: product_notifications_email_productId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "product_notifications_email_productId_key" ON public.product_notifications USING btree (email, "productId");


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: recently_viewed_userId_productId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "recently_viewed_userId_productId_key" ON public.recently_viewed USING btree ("userId", "productId");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: training_programs_name_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX training_programs_name_key ON public.training_programs USING btree (name);


--
-- Name: training_programs_slug_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX training_programs_slug_key ON public.training_programs USING btree (slug);


--
-- Name: training_registrations_registrationNumber_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "training_registrations_registrationNumber_key" ON public.training_registrations USING btree ("registrationNumber");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verificationtokens_identifier_token_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX verificationtokens_identifier_token_key ON public.verificationtokens USING btree (identifier, token);


--
-- Name: verificationtokens_token_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX verificationtokens_token_key ON public.verificationtokens USING btree (token);


--
-- Name: wishlist_items_userId_productId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON public.wishlist_items USING btree ("userId", "productId");


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_categories product_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_categories product_categories_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_discounts product_discounts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_discounts
    ADD CONSTRAINT "product_discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_notifications product_notifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.product_notifications
    ADD CONSTRAINT "product_notifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotional_banners promotional_banners_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.promotional_banners
    ADD CONSTRAINT "promotional_banners_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: promotional_banners promotional_banners_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.promotional_banners
    ADD CONSTRAINT "promotional_banners_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recently_viewed recently_viewed_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT "recently_viewed_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recently_viewed recently_viewed_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT "recently_viewed_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_registrations training_registrations_trainingProgramId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT "training_registrations_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES public.training_programs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_registrations training_registrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.training_registrations
    ADD CONSTRAINT "training_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wishlist_items wishlist_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: all_models; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION all_models FOR ALL TABLES WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION all_models OWNER TO postgres;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: prisma_migration
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 8sgLRixTQkrUGbvEuKTMe4FzPxZQRqBMY55yaYh65eR0pwrU2Q98V5UhDZOJOCj

