--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: guest_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.guest_type AS ENUM (
    'family',
    'all_male',
    'all_female',
    'couple',
    'business',
    'solo'
);


ALTER TYPE public.guest_type OWNER TO postgres;

--
-- Name: update_events_updated_at(); Type: FUNCTION; Schema: public; Owner: alexanderigelsboeck
--

CREATE FUNCTION public.update_events_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_events_updated_at() OWNER TO alexanderigelsboeck;

--
-- Name: update_shop_products_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_shop_products_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_shop_products_updated_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url character varying(500),
    activity_type character varying(100),
    target_guest_types public.guest_type[] DEFAULT ARRAY['family'::public.guest_type, 'all_male'::public.guest_type, 'all_female'::public.guest_type, 'couple'::public.guest_type, 'business'::public.guest_type, 'solo'::public.guest_type],
    location character varying(255),
    contact_info character varying(255),
    operating_hours character varying(255),
    price_range character varying(50),
    booking_required boolean DEFAULT false,
    booking_url character varying(500),
    booking_phone character varying(20),
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    activity_labels text[],
    weather_suitability text[],
    title_de character varying(255),
    description_de text,
    multilingual_content jsonb DEFAULT '{}'::jsonb,
    season character varying(50) DEFAULT 'all'::character varying,
    season_start_month integer DEFAULT 1,
    season_end_month integer DEFAULT 12,
    weather_dependent boolean DEFAULT false,
    min_temperature integer,
    max_temperature integer,
    season_recommendation character varying(100),
    elevation_gain character varying(100),
    drive_time character varying(50)
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: COLUMN activities.title_de; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.title_de IS 'German translation of activity title';


--
-- Name: COLUMN activities.description_de; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.description_de IS 'German translation of activity description';


--
-- Name: COLUMN activities.multilingual_content; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.multilingual_content IS 'JSONB field for flexible multilingual content support';


--
-- Name: COLUMN activities.season; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.season IS 'Primary season for the activity: winter, summer, spring, autumn, all, winter_summer';


--
-- Name: COLUMN activities.season_start_month; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.season_start_month IS 'Month when season starts (1-12)';


--
-- Name: COLUMN activities.season_end_month; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.season_end_month IS 'Month when season ends (1-12)';


--
-- Name: COLUMN activities.weather_dependent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.weather_dependent IS 'Whether activity depends on weather conditions';


--
-- Name: COLUMN activities.min_temperature; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.min_temperature IS 'Minimum temperature in Celsius for outdoor activities';


--
-- Name: COLUMN activities.max_temperature; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.activities.max_temperature IS 'Maximum temperature in Celsius for outdoor activities';


--
-- Name: background_images; Type: TABLE; Schema: public; Owner: alexanderigelsboeck
--

CREATE TABLE public.background_images (
    id integer NOT NULL,
    property_id uuid,
    filename character varying(255) NOT NULL,
    file_path text,
    upload_date timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    season character varying(50) DEFAULT 'all'::character varying,
    upload_type character varying(50) DEFAULT 'upload'::character varying,
    title character varying(255),
    description text,
    display_order integer DEFAULT 0,
    image_url character varying(500)
);


ALTER TABLE public.background_images OWNER TO alexanderigelsboeck;

--
-- Name: TABLE background_images; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON TABLE public.background_images IS 'Seasonal background images for properties in tvOS app';


--
-- Name: COLUMN background_images.season; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.background_images.season IS 'Season for the image: winter, summer, spring, autumn, all';


--
-- Name: COLUMN background_images.upload_type; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.background_images.upload_type IS 'How the image was added: upload or url';


--
-- Name: background_images_id_seq; Type: SEQUENCE; Schema: public; Owner: alexanderigelsboeck
--

CREATE SEQUENCE public.background_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.background_images_id_seq OWNER TO alexanderigelsboeck;

--
-- Name: background_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alexanderigelsboeck
--

ALTER SEQUENCE public.background_images_id_seq OWNED BY public.background_images.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price_at_time numeric(10,2) NOT NULL,
    options jsonb DEFAULT '{}'::jsonb,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: TABLE cart_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cart_items IS 'Individual items in shopping carts';


--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    device_name character varying(255) NOT NULL,
    device_type character varying(50) DEFAULT 'apple_tv'::character varying,
    mac_address character varying(17),
    ip_address inet,
    last_seen timestamp with time zone DEFAULT now(),
    software_version character varying(50),
    is_online boolean DEFAULT false,
    settings jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: dining_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dining_features (
    id integer NOT NULL,
    dining_id integer,
    feature_type character varying(50) NOT NULL,
    feature_value character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dining_features OWNER TO postgres;

--
-- Name: dining_features_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dining_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dining_features_id_seq OWNER TO postgres;

--
-- Name: dining_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dining_features_id_seq OWNED BY public.dining_features.id;


--
-- Name: dining_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dining_hours (
    id integer NOT NULL,
    dining_id integer,
    season character varying(20) NOT NULL,
    day_of_week character varying(20),
    open_time time without time zone,
    close_time time without time zone,
    is_closed boolean DEFAULT false,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dining_hours OWNER TO postgres;

--
-- Name: dining_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dining_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dining_hours_id_seq OWNER TO postgres;

--
-- Name: dining_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dining_hours_id_seq OWNED BY public.dining_hours.id;


--
-- Name: dining_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dining_options (
    id integer NOT NULL,
    external_id character varying(50) NOT NULL,
    name_de character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    location_area character varying(100),
    street_address character varying(255),
    postal_code character varying(10),
    city character varying(100),
    altitude_m integer,
    phone character varying(50),
    website character varying(255),
    email character varying(255),
    hours_winter text,
    hours_summer text,
    cuisine_type character varying(100),
    price_range integer,
    capacity_indoor integer,
    capacity_outdoor integer,
    capacity_total integer,
    awards text,
    accessibility character varying(100),
    parking boolean DEFAULT false,
    family_friendly boolean DEFAULT false,
    vegetarian boolean DEFAULT false,
    vegan boolean DEFAULT false,
    gluten_free boolean DEFAULT false,
    reservations_required character varying(50),
    season_recommendation character varying(50),
    relevance_status character varying(50),
    image_url text,
    latitude numeric(10,6),
    longitude numeric(10,6),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_imported date,
    access_by_car boolean DEFAULT false,
    access_by_cable_car boolean DEFAULT false,
    access_by_hiking boolean DEFAULT false,
    access_by_bike boolean DEFAULT false,
    access_by_lift boolean DEFAULT false,
    access_by_public_transport boolean DEFAULT false,
    access_difficulty character varying(50),
    access_time_minutes integer,
    access_notes text,
    event_type character varying(100),
    atmosphere character varying(50),
    target_guest_types text,
    CONSTRAINT dining_options_price_range_check CHECK (((price_range >= 1) AND (price_range <= 5)))
);


ALTER TABLE public.dining_options OWNER TO postgres;

--
-- Name: COLUMN dining_options.access_by_car; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_by_car IS 'Accessible by car/vehicle';


--
-- Name: COLUMN dining_options.access_by_cable_car; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_by_cable_car IS 'Accessible by cable car/gondola';


--
-- Name: COLUMN dining_options.access_by_hiking; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_by_hiking IS 'Accessible by hiking/walking';


--
-- Name: COLUMN dining_options.access_by_bike; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_by_bike IS 'Accessible by bicycle/mountain bike';


--
-- Name: COLUMN dining_options.access_by_lift; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_by_lift IS 'Accessible by ski lift';


--
-- Name: COLUMN dining_options.access_by_public_transport; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_by_public_transport IS 'Accessible by bus/train';


--
-- Name: COLUMN dining_options.access_difficulty; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_difficulty IS 'Difficulty level for accessing (easy, moderate, difficult)';


--
-- Name: COLUMN dining_options.access_time_minutes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_time_minutes IS 'Estimated time to reach in minutes';


--
-- Name: COLUMN dining_options.access_notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.access_notes IS 'Additional access information and directions';


--
-- Name: COLUMN dining_options.event_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.event_type IS 'Type of events/entertainment (Austrian_Party, Traditional_Party, Live_Music, DJ_Night, etc.)';


--
-- Name: COLUMN dining_options.atmosphere; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.atmosphere IS 'General atmosphere/vibe (party, romantic, family, business, casual, lively, quiet)';


--
-- Name: COLUMN dining_options.target_guest_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dining_options.target_guest_types IS 'JSON array of target guest types (boys_weekend, girls_weekend, couples, families, etc.)';


--
-- Name: dining_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dining_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dining_options_id_seq OWNER TO postgres;

--
-- Name: dining_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dining_options_id_seq OWNED BY public.dining_options.id;


--
-- Name: dining_places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dining_places (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    cuisine_type character varying(100),
    price_range character varying(50),
    location character varying(255),
    address text,
    phone character varying(50),
    website character varying(255),
    opening_hours jsonb,
    rating numeric(3,2),
    image_url character varying(500),
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    reservation_required boolean DEFAULT false,
    reservation_url character varying(255),
    tags text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dining_places OWNER TO postgres;

--
-- Name: dining_places_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dining_places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dining_places_id_seq OWNER TO postgres;

--
-- Name: dining_places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dining_places_id_seq OWNED BY public.dining_places.id;


--
-- Name: dining_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dining_reviews (
    id integer NOT NULL,
    dining_id integer,
    guest_name character varying(100),
    rating integer,
    review text,
    visit_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT dining_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.dining_reviews OWNER TO postgres;

--
-- Name: dining_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dining_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dining_reviews_id_seq OWNER TO postgres;

--
-- Name: dining_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dining_reviews_id_seq OWNED BY public.dining_reviews.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: alexanderigelsboeck
--

CREATE TABLE public.events (
    id integer NOT NULL,
    external_id character varying(255),
    name character varying(255) NOT NULL,
    description text,
    location character varying(255),
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    image_url text,
    source_url text,
    category character varying(100),
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    price_info text,
    contact_info text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    season character varying(50) DEFAULT 'all'::character varying,
    season_start_month integer DEFAULT 1,
    season_end_month integer DEFAULT 12,
    weather_dependent boolean DEFAULT false,
    min_temperature integer,
    max_temperature integer
);


ALTER TABLE public.events OWNER TO alexanderigelsboeck;

--
-- Name: COLUMN events.season; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.events.season IS 'Primary season for the event: winter, summer, spring, autumn, all, winter_summer';


--
-- Name: COLUMN events.season_start_month; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.events.season_start_month IS 'Month when season starts (1-12)';


--
-- Name: COLUMN events.season_end_month; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.events.season_end_month IS 'Month when season ends (1-12)';


--
-- Name: COLUMN events.weather_dependent; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.events.weather_dependent IS 'Whether event depends on weather conditions';


--
-- Name: COLUMN events.min_temperature; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.events.min_temperature IS 'Minimum temperature in Celsius for outdoor events';


--
-- Name: COLUMN events.max_temperature; Type: COMMENT; Schema: public; Owner: alexanderigelsboeck
--

COMMENT ON COLUMN public.events.max_temperature IS 'Maximum temperature in Celsius for outdoor events';


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: alexanderigelsboeck
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO alexanderigelsboeck;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alexanderigelsboeck
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: guest_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guest_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    guest_id uuid NOT NULL,
    streaming_service_id uuid NOT NULL,
    device_id uuid,
    session_token character varying(500),
    login_timestamp timestamp with time zone DEFAULT now(),
    logout_timestamp timestamp with time zone,
    auto_logout_scheduled timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.guest_sessions OWNER TO postgres;

--
-- Name: guests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    guest_type public.guest_type DEFAULT 'family'::public.guest_type NOT NULL,
    party_size integer DEFAULT 1,
    check_in_date timestamp with time zone NOT NULL,
    check_out_date timestamp with time zone NOT NULL,
    actual_check_in timestamp with time zone,
    actual_check_out timestamp with time zone,
    special_requests text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    guest_labels text[],
    notes text,
    language character varying(5) DEFAULT 'en'::character varying NOT NULL,
    CONSTRAINT guests_language_check CHECK (((language)::text = ANY ((ARRAY['en'::character varying, 'de'::character varying, 'fr'::character varying, 'it'::character varying, 'es'::character varying])::text[])))
);


ALTER TABLE public.guests OWNER TO postgres;

--
-- Name: properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.properties (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    address text,
    wifi_ssid character varying(100),
    wifi_password character varying(100),
    welcome_message text,
    house_rules text,
    emergency_contact text,
    checkout_instructions text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    type character varying(50) DEFAULT 'apartment'::character varying,
    CONSTRAINT check_property_type CHECK (((type)::text = ANY ((ARRAY['apartment'::character varying, 'house'::character varying, 'villa'::character varying, 'condo'::character varying, 'cabin'::character varying, 'chalet'::character varying, 'hotel'::character varying, 'resort'::character varying])::text[])))
);


ALTER TABLE public.properties OWNER TO postgres;

--
-- Name: shop_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shop_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    short_description character varying(500),
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    currency character varying(3) DEFAULT 'EUR'::character varying,
    image_url text,
    additional_images jsonb DEFAULT '[]'::jsonb,
    category character varying(50) NOT NULL,
    availability character varying(20) DEFAULT 'in_stock'::character varying,
    stock_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    is_locally_made boolean DEFAULT true,
    is_sustainable boolean DEFAULT false,
    craftsperson_name character varying(255),
    craftsperson_bio text,
    vendor_id uuid,
    materials jsonb DEFAULT '[]'::jsonb,
    dimensions character varying(255),
    weight character varying(50),
    care_instructions text,
    tags jsonb DEFAULT '[]'::jsonb,
    sku character varying(100),
    barcode character varying(100),
    meta_title character varying(255),
    meta_description text,
    slug character varying(255),
    rating_average numeric(3,2) DEFAULT 0,
    rating_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_archived boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shop_products_availability_check CHECK (((availability)::text = ANY ((ARRAY['in_stock'::character varying, 'low_stock'::character varying, 'out_of_stock'::character varying, 'made_to_order'::character varying])::text[]))),
    CONSTRAINT shop_products_original_price_check CHECK ((original_price >= (0)::numeric)),
    CONSTRAINT shop_products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT shop_products_rating_average_check CHECK (((rating_average >= (0)::numeric) AND (rating_average <= (5)::numeric))),
    CONSTRAINT shop_products_rating_count_check CHECK ((rating_count >= 0)),
    CONSTRAINT shop_products_stock_count_check CHECK ((stock_count >= 0))
);


ALTER TABLE public.shop_products OWNER TO postgres;

--
-- Name: TABLE shop_products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shop_products IS 'Stores alpine living goods and products for the Shop Moments feature';


--
-- Name: shopping_carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shopping_carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guest_id uuid,
    property_id uuid NOT NULL,
    session_id character varying(255),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + '30 days'::interval),
    CONSTRAINT shopping_carts_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'abandoned'::character varying, 'converted'::character varying, 'expired'::character varying])::text[]))),
    CONSTRAINT unique_cart_per_guest_or_session CHECK ((((guest_id IS NOT NULL) AND (session_id IS NULL)) OR ((guest_id IS NULL) AND (session_id IS NOT NULL))))
);


ALTER TABLE public.shopping_carts OWNER TO postgres;

--
-- Name: TABLE shopping_carts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.shopping_carts IS 'Shopping carts for guests to collect products';


--
-- Name: streaming_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streaming_services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid NOT NULL,
    service_name character varying(100) NOT NULL,
    service_type character varying(50) NOT NULL,
    app_url_scheme character varying(255),
    logo_url character varying(500),
    instructions text,
    requires_login boolean DEFAULT true,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.streaming_services OWNER TO postgres;

--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guest_id uuid NOT NULL,
    product_id uuid NOT NULL,
    property_id uuid NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Name: TABLE wishlists; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.wishlists IS 'Guest wishlists for saving favorite products';


--
-- Name: background_images id; Type: DEFAULT; Schema: public; Owner: alexanderigelsboeck
--

ALTER TABLE ONLY public.background_images ALTER COLUMN id SET DEFAULT nextval('public.background_images_id_seq'::regclass);


--
-- Name: dining_features id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_features ALTER COLUMN id SET DEFAULT nextval('public.dining_features_id_seq'::regclass);


--
-- Name: dining_hours id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_hours ALTER COLUMN id SET DEFAULT nextval('public.dining_hours_id_seq'::regclass);


--
-- Name: dining_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_options ALTER COLUMN id SET DEFAULT nextval('public.dining_options_id_seq'::regclass);


--
-- Name: dining_places id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_places ALTER COLUMN id SET DEFAULT nextval('public.dining_places_id_seq'::regclass);


--
-- Name: dining_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_reviews ALTER COLUMN id SET DEFAULT nextval('public.dining_reviews_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: alexanderigelsboeck
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, property_id, title, description, image_url, activity_type, target_guest_types, location, contact_info, operating_hours, price_range, booking_required, booking_url, booking_phone, is_active, display_order, created_at, updated_at, activity_labels, weather_suitability, title_de, description_de, multilingual_content, season, season_start_month, season_end_month, weather_dependent, min_temperature, max_temperature, season_recommendation, elevation_gain, drive_time) FROM stdin;
ff77dc70-9a29-4de4-a793-dcdb06d8731c	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Mirror Lake Trail (Reiteralm)	Easy, scenic 4.2 km trail (~1 h 40 min) from Preunegg Jet to Spiegelsee & Obersee, famed for Dachstein reflections.	\N	wellness	{family,couple,family}	Reiteralm	\N	May–Oct	\N	f	https://www.schladming-dachstein.at/en/regional-and-offerings/tours/From-the-Reiteralm-to-famous-Mirror-Lake_td_370661	\N	t	0	2025-08-19 17:41:21.462223+02	2025-08-19 17:41:21.462223+02	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Wanderung zum Spiegelsee (Reiteralm)	Leichte, malerische 4,2 km Wanderung (~1 h 40 min) ab Preunegg Jet zu Spiegelsee & Obersee. Berühmt für Dachstein-Spiegelungen.	{"de": {"title": "Wanderung zum Spiegelsee (Reiteralm)", "description": "Leichte, malerische 4,2 km Wanderung (~1 h 40 min) ab Preunegg Jet zu Spiegelsee & Obersee. Berühmt für Dachstein-Spiegelungen."}, "en": {"title": "Mirror Lake Trail (Reiteralm)", "description": "Easy, scenic 4.2 km trail (~1 h 40 min) from Preunegg Jet to Spiegelsee & Obersee, famed for Dachstein reflections."}}	all	1	12	f	\N	\N	\N	\N	\N
6f67215b-8b18-4460-a0ce-b569c1d5ce7d	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Complete Lake Circuit (Spiegelsee & Untersee)	~5.1 km circuit (~3 h with breaks) covering Spiegelsee, Untersee, Waldsee; ideal scenic loop.	\N	wellness	{family,couple,family}	Reiteralm	\N	May–Oct	\N	f	https://365austria.com/en/lake-hike-from-the-reiteralm-to-the-spiegelsee-and-untersee/	\N	t	0	2025-08-19 17:41:21.488189+02	2025-08-19 17:41:21.488189+02	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Komplette Seenrunde (Spiegelsee & Untersee)	Ca. 5,1 km Rundweg (~3 h inkl. Pausen) über Spiegelsee, Untersee, Waldsee; ideal.	{"de": {"title": "Komplette Seenrunde (Spiegelsee & Untersee)", "description": "Ca. 5,1 km Rundweg (~3 h inkl. Pausen) über Spiegelsee, Untersee, Waldsee; ideal."}, "en": {"title": "Complete Lake Circuit (Spiegelsee & Untersee)", "description": "~5.1 km circuit (~3 h with breaks) covering Spiegelsee, Untersee, Waldsee; ideal scenic loop."}}	all	1	12	f	\N	\N	\N	\N	\N
da0de8c7-dfea-4bf9-8b4d-9b8a60c9e966	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Gasselhöhe–Spiegelsee–Obersee Panorama	Trail from Gasselhöhe hut through forest to Spiegelsee; optional ascent to Rippetegg (2,126 m) via Obersee.	\N	adventure	{all_male,all_female,solo,all_male,all_female}	Reiteralm	\N	Summer (good weather)	\N	f	https://www.outdooractive.com/de/route/wandern/schladming-dachstein/reiteralm-spiegelsee/1507186/	\N	t	0	2025-08-19 17:41:21.489271+02	2025-08-19 17:41:21.489271+02	{intense/adventure,"girls/boys weekend"}	{sunny,partly_cloudy}	Gasselhöhe–Spiegelsee–Obersee Panorama	Wanderung zur Gasselhöhe, durch Wald zum Spiegelsee; optionale Besteigung Rippetegg (2 126 m) über Obersee.	{"de": {"title": "Gasselhöhe–Spiegelsee–Obersee Panorama", "description": "Wanderung zur Gasselhöhe, durch Wald zum Spiegelsee; optionale Besteigung Rippetegg (2 126 m) über Obersee."}, "en": {"title": "Gasselhöhe–Spiegelsee–Obersee Panorama", "description": "Trail from Gasselhöhe hut through forest to Spiegelsee; optional ascent to Rippetegg (2,126 m) via Obersee."}}	all	1	12	f	\N	\N	\N	\N	\N
bca45c7f-eb9a-4338-b98f-c7d89a88c65b	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Mirror Lake Extended Loop	Extended route: return via Untersee (+30 min) or loop via Rippetegg & Gasselhöhe (+2 h).	\N	adventure	{all_male,all_female,solo}	Reiteralm	\N	May–Oct	\N	f	https://www.reiteralm.at/de/sommer/wandern/wandertouren/Spiegelsee	\N	t	0	2025-08-19 17:41:21.49089+02	2025-08-19 17:41:21.49089+02	{intense/adventure}	{sunny,partly_cloudy}	Spiegelsee erweiterte Runde	Erweiterung mit Rückweg über Untersee (+ 30 min) oder große Runde über Rippetegg & Gasselhöhe (+ 2 h).	{"de": {"title": "Spiegelsee erweiterte Runde", "description": "Erweiterung mit Rückweg über Untersee (+ 30 min) oder große Runde über Rippetegg & Gasselhöhe (+ 2 h)."}, "en": {"title": "Mirror Lake Extended Loop", "description": "Extended route: return via Untersee (+30 min) or loop via Rippetegg & Gasselhöhe (+2 h)."}}	all	1	12	f	\N	\N	\N	\N	\N
81567713-e187-4210-b81f-45161cbf825a	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Reiteralm Lake Stroller Loop	Easy circular walk from Preunegg Jet around Reiteralm Lake; flat and stroller-friendly.	\N	wellness	{family,couple,family}	Reiteralm	\N	Summer	\N	f	https://www.schladming-dachstein.at/en/summer/excursion-mountains/reiteralm-summer	\N	t	0	2025-08-19 17:41:21.492105+02	2025-08-19 17:41:21.492105+02	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Reiteralmsee Rundweg (kinderwagentauglich)	Leichter Rundweg ab Preunegg-Jet um den Reiteralmsee; flach und kinderwagentauglich.	{"de": {"title": "Reiteralmsee Rundweg (kinderwagentauglich)", "description": "Leichter Rundweg ab Preunegg-Jet um den Reiteralmsee; flach und kinderwagentauglich."}, "en": {"title": "Reiteralm Lake Stroller Loop", "description": "Easy circular walk from Preunegg Jet around Reiteralm Lake; flat and stroller-friendly."}}	all	1	12	f	\N	\N	\N	\N	\N
24aa4fe2-b8dd-4987-acf2-5eb177633856	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Moaralmsee Alpine Loop	Scenic summit hike over Hauser Kaibling (2,015 m) with panoramic views, descent to turquoise lake via trail 45.	\N	adventure	{all_male,all_female,solo}	Hauser Kaibling	\N	Summer	\N	f	https://www.schladming-dachstein.at/en/regional-and-offerings/tours/Hauser-Kaibling-Moaralmsee-Hans-Wodl-Hutte-Steirischer-Bodensee_td_9999946/	\N	t	0	2025-08-19 17:41:21.49325+02	2025-08-19 17:41:21.49325+02	{intense/adventure}	{sunny,partly_cloudy}	Alpiner Rundweg Moaralmsee	Gipfelwanderung über Hauser Kaibling (2 015 m) mit Panoramablick, Abstieg zum türkisfarbenen Moaralmsee via Weg 45.	{"de": {"title": "Alpiner Rundweg Moaralmsee", "description": "Gipfelwanderung über Hauser Kaibling (2 015 m) mit Panoramablick, Abstieg zum türkisfarbenen Moaralmsee via Weg 45."}, "en": {"title": "Moaralmsee Alpine Loop", "description": "Scenic summit hike over Hauser Kaibling (2,015 m) with panoramic views, descent to turquoise lake via trail 45."}}	all	1	12	f	\N	\N	\N	\N	\N
eac706b9-3826-40be-867b-064d3d864b1a	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Schafsinn Circular Trail	Family loop with barefoot/sheep-themed stations; short stroller (40 min) or full hiker loop (1 h 45 min).	\N	wellness	{family,couple,family}	Hauser Kaibling	\N	Summer	\N	f	https://www.schladming-dachstein.at/en/regional-and-offerings/tours/Circular-hiking-trail-sheep-sense-at-Hauser-Kaibling_td_370680	\N	t	0	2025-08-19 17:41:21.49441+02	2025-08-19 17:41:21.49441+02	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Schafsinn-Rundweg	Familienrunde mit Barfuß-/"Schafsinn"-Stationen; kurze kinderwagentaugliche Schleife (40 min) oder volle Runde (1 h 45 min).	{"de": {"title": "Schafsinn-Rundweg", "description": "Familienrunde mit Barfuß-/\\"Schafsinn\\"-Stationen; kurze kinderwagentaugliche Schleife (40 min) oder volle Runde (1 h 45 min)."}, "en": {"title": "Schafsinn Circular Trail", "description": "Family loop with barefoot/sheep-themed stations; short stroller (40 min) or full hiker loop (1 h 45 min)."}}	all	1	12	f	\N	\N	\N	\N	\N
8b3ff23c-4e43-477e-af59-3f48abb90d7e	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Hopsiland Planai (Playground Trail)	Elevated playground loop with slides, water play, marble runs, lift access — 1.5 km stroller-friendly.	\N	wellness	{family,couple,family}	Planai	\N	Summer	\N	f	https://www.planai.at/en/summer/hopsiland-planai	\N	t	0	2025-08-19 17:41:21.495223+02	2025-08-19 17:41:21.495223+02	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Hopsiland Planai	Höchstgelegener Spielplatz: 1,5 km kinderwagentauglicher Rundweg auf Planai mit Rutschen, Wasserspielen etc.	{"de": {"title": "Hopsiland Planai", "description": "Höchstgelegener Spielplatz: 1,5 km kinderwagentauglicher Rundweg auf Planai mit Rutschen, Wasserspielen etc."}, "en": {"title": "Hopsiland Planai (Playground Trail)", "description": "Elevated playground loop with slides, water play, marble runs, lift access — 1.5 km stroller-friendly."}}	all	1	12	f	\N	\N	\N	\N	\N
699892f0-f14f-4aaf-98cb-80d47757aeb7	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Dachstein Skywalk + Ice Palace	Glacier attractions: skywalk, suspension bridge, glass stairway, plus Ice Palace.	\N	adventure	{all_male,all_female,solo}	Dachstein	\N	Summer (lift deps.)	\N	f	https://www.derdachstein.at/en/dachstein-glacier-world/glacier-experience/suspension-bridge	\N	t	0	2025-08-19 17:41:21.496211+02	2025-08-19 17:41:21.496211+02	{intense/adventure,all-weather*}	{sunny,partly_cloudy}	Dachstein Skywalk, Suspension Bridge, "Stairway to Nothingness" & Ice Palace	Gletscher-Attraktionen: Skywalk, Hängebrücke, gläserne Treppe „ins Nichts“ und Eispalast.	{"de": {"title": "Dachstein Skywalk, Suspension Bridge, \\"Stairway to Nothingness\\" & Ice Palace", "description": "Gletscher-Attraktionen: Skywalk, Hängebrücke, gläserne Treppe „ins Nichts“ und Eispalast."}, "en": {"title": "Dachstein Skywalk + Ice Palace", "description": "Glacier attractions: skywalk, suspension bridge, glass stairway, plus Ice Palace."}}	all	1	12	f	\N	\N	\N	\N	\N
311cbe21-c0c5-419c-8f3c-266ec25cbf93	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Rittisberg Coaster (Summer Toboggan)	1.3 km alpine coaster with spirals and banked turns; operates in sun or rain.	\N	wellness	{family,couple,family}	Ramsau	\N	Summer	\N	f	https://www.schladming-dachstein.at/en/service/infos-from-a-z/Rittisberg-Coaster-summer-toboggan-run_az_342185	\N	t	0	2025-08-19 17:41:21.497125+02	2025-08-19 17:41:21.497125+02	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Rittisberg Coaster	1,3 km Alpen-Coaster mit Spiralen & Steilkurven; bei Sonne oder Regen geöffnet.	{"de": {"title": "Rittisberg Coaster", "description": "1,3 km Alpen-Coaster mit Spiralen & Steilkurven; bei Sonne oder Regen geöffnet."}, "en": {"title": "Rittisberg Coaster (Summer Toboggan)", "description": "1.3 km alpine coaster with spirals and banked turns; operates in sun or rain."}}	all	1	12	f	\N	\N	\N	\N	\N
5ec09f4e-17f6-4ba4-9fb6-1c0541939e91	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Erlebnisbad Schladming	Indoor pool with 66 m slide, kids area, sauna & fitness—perfect for rainy days.	\N	indoor	{family,couple,solo,all_male,all_female}	Schladming	\N	All year	\N	f	https://erlebnisbad-schladming.at/	\N	t	0	2025-08-19 17:41:21.49805+02	2025-08-19 17:41:21.49805+02	{indoor}	{indoor,rain,any}	Erlebnisbad Schladming	Hallenbad mit 66 m Rutsche, Kinderbereich, Sauna & Fitness – ideal bei Regen.	{"de": {"title": "Erlebnisbad Schladming", "description": "Hallenbad mit 66 m Rutsche, Kinderbereich, Sauna & Fitness – ideal bei Regen."}, "en": {"title": "Erlebnisbad Schladming", "description": "Indoor pool with 66 m slide, kids area, sauna & fitness—perfect for rainy days."}}	all	1	12	f	\N	\N	\N	\N	\N
2c7c1e31-937c-4061-b86f-cd003ee4f85c	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Therme Amadé (Altenmarkt)	Spa & water world with slides (incl. loop), pools & saunas; open 09:00–22:00.	\N	indoor	{family,couple,solo,all_male,all_female}	Altenmarkt	\N	All year	\N	f	https://www.thermeamade.at/en/	\N	t	0	2025-08-19 17:41:21.498637+02	2025-08-19 17:41:21.498637+02	{indoor,all-weather}	{indoor,rain,any}	Erlebnis-Therme	Familien-Therme mit Rutschen (inkl. Looping), Becken & Saunawelt; täglich 09–22 Uhr.	{"de": {"title": "Erlebnis-Therme", "description": "Familien-Therme mit Rutschen (inkl. Looping), Becken & Saunawelt; täglich 09–22 Uhr."}, "en": {"title": "Therme Amadé (Altenmarkt)", "description": "Spa & water world with slides (incl. loop), pools & saunas; open 09:00–22:00."}}	all	1	12	f	\N	\N	\N	\N	\N
b56f6fef-d456-4481-89db-cb50e55e82e4	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Adventure Park Gröbming	Forest high-rope park: 18–22 courses, 200+ stations—great for families/groups.	\N	adventure	{all_male,all_female,solo}	Gröbming	\N	Summer	\N	f	https://www.abenteuerpark.at/	\N	t	0	2025-08-19 17:41:21.499242+02	2025-08-19 17:41:21.499242+02	{intense/adventure}	{sunny,partly_cloudy}	Abenteuerpark Gröbming	Hochseilpark im Wald: 18–22 Parcours, 200+ Stationen; ideal für Familien/Gruppen.	{"de": {"title": "Abenteuerpark Gröbming", "description": "Hochseilpark im Wald: 18–22 Parcours, 200+ Stationen; ideal für Familien/Gruppen."}, "en": {"title": "Adventure Park Gröbming", "description": "Forest high-rope park: 18–22 courses, 200+ stations—great for families/groups."}}	all	1	12	f	\N	\N	\N	\N	\N
ced64ad3-eeee-47a5-a5ab-432e13c85907	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Zipline Stoderzinken	Europe’s mega zipline: 2.5 km, ~115 km/h, four parallel lines—adrenaline rush.	\N	adventure	{all_male,all_female,solo}	Gröbming	\N	Summer	\N	f	https://www.zipline.at/en	\N	t	0	2025-08-19 17:41:21.500197+02	2025-08-19 17:41:21.500197+02	{intense/adventure}	{sunny,partly_cloudy}	Zipline Stoderzinken	Europas Mega-Zipline: 2,5 km, bis ~115 km/h, vier Seile – Adrenalinkick pur.	{"de": {"title": "Zipline Stoderzinken", "description": "Europas Mega-Zipline: 2,5 km, bis ~115 km/h, vier Seile – Adrenalinkick pur."}, "en": {"title": "Zipline Stoderzinken", "description": "Europe’s mega zipline: 2.5 km, ~115 km/h, four parallel lines—adrenaline rush."}}	all	1	12	f	\N	\N	\N	\N	\N
8c257f12-c2be-4cfa-85b2-2b99604c69dd	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Tandem Paragliding	Soar over Schladming with certified pilots.	\N	adventure	{all_male,all_female,solo}	Planai/Hochwurzen	\N	Summer (weather dep.)	\N	f	https://www.planai.at/en/summer/paragliding	\N	t	0	2025-08-19 17:41:21.500909+02	2025-08-19 17:41:21.500909+02	{intense/adventure}	{sunny,partly_cloudy}	Tandem-Paragleiten	Über Schladming schweben mit staatlich geprüften Piloten.	{"de": {"title": "Tandem-Paragleiten", "description": "Über Schladming schweben mit staatlich geprüften Piloten."}, "en": {"title": "Tandem Paragliding", "description": "Soar over Schladming with certified pilots."}}	all	1	12	f	\N	\N	\N	\N	\N
21a56bed-0d5e-4b63-a4fe-ca4f8e72ebf6	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Enns Bike Path	Scenic river bike path with easy family sections through valleys & lakes.	\N	outdoor	{family}	Enns Valley	\N	Summer	\N	f	https://www.schladming-dachstein.at/en/summer/biking/enns-bike-path	\N	t	0	2025-08-19 17:41:21.501759+02	2025-08-19 17:41:21.501759+02	{family-friendly}	{sunny,partly_cloudy}	Ennsradweg	Malerischer Flussradweg mit familienfreundlichen Abschnitten durch Täler & Seen.	{"de": {"title": "Ennsradweg", "description": "Malerischer Flussradweg mit familienfreundlichen Abschnitten durch Täler & Seen."}, "en": {"title": "Enns Bike Path", "description": "Scenic river bike path with easy family sections through valleys & lakes."}}	all	1	12	f	\N	\N	\N	\N	\N
a61d811a-994d-40d3-9500-2cb368e7ef56	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Rafting on the Enns	Beginner-friendly white-water rafting with local guides.	\N	adventure	{all_male,all_female,solo}	Enns	\N	Summer	\N	f	https://www.rafting.at/en.html	\N	t	0	2025-08-19 17:41:21.502736+02	2025-08-19 17:41:21.502736+02	{intense/adventure}	{sunny,partly_cloudy}	Rafting auf der Enns	Einsteigerfreundliches Wildwasser mit lokalen Guides.	{"de": {"title": "Rafting auf der Enns", "description": "Einsteigerfreundliches Wildwasser mit lokalen Guides."}, "en": {"title": "Rafting on the Enns", "description": "Beginner-friendly white-water rafting with local guides."}}	all	1	12	f	\N	\N	\N	\N	\N
8e137bc7-bf08-4225-bd6b-3d04574fd51d	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Schladming Brewery Tour	Local "green" brewery—visit shop or tasting, great on rainy days.	\N	indoor	{couple,family}	Schladming	\N	All year	\N	f	https://www.schladmingerbier.at/	\N	t	0	2025-08-19 17:41:21.503465+02	2025-08-19 17:41:21.503465+02	{chill/relaxing,indoor}	{indoor,rain,any}	Schladminger Brauerei	Regionale „Green Brewery“ mit Shop/Verkostung—ideal bei Regen.	{"de": {"title": "Schladminger Brauerei", "description": "Regionale „Green Brewery“ mit Shop/Verkostung—ideal bei Regen."}, "en": {"title": "Schladming Brewery Tour", "description": "Local \\"green\\" brewery—visit shop or tasting, great on rainy days."}}	all	1	12	f	\N	\N	\N	\N	\N
9a0377be-7ccd-4bd8-86f3-ae91d0316508	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Golfclub Schladming-Dachstein	18-hole "Pebble Beach of the Alps", picturesque and challenging.	\N	wellness	{couple,family}	Haus im Ennstal	\N	Summer	\N	f	https://www.schladming-golf.at/en/home/	\N	t	0	2025-08-19 17:41:21.504242+02	2025-08-19 17:41:21.504242+02	{chill/relaxing}	{sunny,partly_cloudy}	Golfclub Schladming-Dachstein	18-Loch-„Pebble Beach der Alpen“: malerisch und sportlich.	{"de": {"title": "Golfclub Schladming-Dachstein", "description": "18-Loch-„Pebble Beach der Alpen“: malerisch und sportlich."}, "en": {"title": "Golfclub Schladming-Dachstein", "description": "18-hole \\"Pebble Beach of the Alps\\", picturesque and challenging."}}	all	1	12	f	\N	\N	\N	\N	\N
d2c59d18-58d4-4fba-825c-d3fb5e68a368	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Wanderung zum Spiegelsee (Reiteralm)	\N	outdoor	{family,couple,solo}	[Details](https://www.schladming-dachstein.at/en/regional-and-offerings/tours/From-the-Reiteralm-to-famous-Mirror-Lake_td_370661)	284 m drive	family-friendly • chill/relaxing	$$	f	\N	\N	t	1	2025-08-19 10:58:57.419515+02	2025-08-19 10:58:57.419515+02	{Leichte,"malerische 4","2 km Wanderung (~1 h 40 min) ab Preunegg Jet zu Spiegelsee & Obersee. Berühmt für Dachstein-Spiegelungen."}	{clear,partly_cloudy}	Mirror Lake Trail (Reiteralm)	Easy, scenic 4.2 km trail (~1 h 40 min) from Preunegg Jet to Spiegelsee & Obersee, famed for Dachstein reflections.	{}	all	1	12	f	\N	\N	family-friendly • chill/relaxing	May–Oct	284 m
5ec3045e-5cc2-4d44-a7de-603a5f51469b	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Komplette Seenrunde (Spiegelsee & Untersee)	\N	outdoor	{family,couple,solo}	[Tour overview](https://365austria.com/en/lake-hike-from-the-reiteralm-to-the-spiegelsee-and-untersee/)	284 m drive	family-friendly • chill/relaxing	$$	f	\N	\N	t	2	2025-08-19 10:58:57.432082+02	2025-08-19 10:58:57.432082+02	{"Ca. 5","1 km Rundweg (~3 h inkl. Pausen) über Spiegelsee",Untersee,"Waldsee; ideal."}	{clear,partly_cloudy}	Complete Lake Circuit (Spiegelsee & Untersee)	~5.1 km circuit (~3 h with breaks) covering Spiegelsee, Untersee, Waldsee; ideal scenic loop.	{}	all	1	12	f	\N	\N	family-friendly • chill/relaxing	May–Oct	284 m
558bcfa7-d686-4884-864e-49ffc7f3afce	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Gasselhöhe–Spiegelsee–Obersee Panorama	\N	outdoor	{family,couple,solo}	[Route description](https://www.outdooractive.com/de/route/wandern/schladming-dachstein/reiteralm-spiegelsee/1507186/)	~700 m loop drive	intense/adventure • girls/boys weekend	$$	f	\N	\N	t	3	2025-08-19 10:58:57.433081+02	2025-08-19 10:58:57.433081+02	{"Wanderung zur Gasselhöhe","durch Wald zum Spiegelsee; optionale Besteigung Rippetegg (2 126 m) über Obersee."}	{clear,partly_cloudy}	Gasselhöhe–Spiegelsee–Obersee Panorama	Trail from Gasselhöhe hut through forest to Spiegelsee; optional ascent to Rippetegg (2,126 m) via Obersee.	{}	all	1	12	f	\N	\N	intense/adventure • girls/boys weekend	Summer (good weather)	~700 m loop
bc4a6d7c-9255-4f46-b7d0-88b9e9ac476f	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Spiegelsee erweiterte Runde	\N	outdoor	{family,couple,solo}	[Variants overview](https://www.reiteralm.at/de/sommer/wandern/wandertouren/Spiegelsee)	+ elevation from above drive	intense/adventure	$$	f	\N	\N	t	4	2025-08-19 10:58:57.433811+02	2025-08-19 10:58:57.433811+02	{"Erweiterung mit Rückweg über Untersee (+ 30 min) oder große Runde über Rippetegg & Gasselhöhe (+ 2 h)."}	{clear,partly_cloudy}	Mirror Lake Extended Loop	Extended route: return via Untersee (+30 min) or loop via Rippetegg & Gasselhöhe (+2 h).	{}	all	1	12	f	\N	\N	intense/adventure	May–Oct	+ elevation from above
406dca40-7cad-47f8-89b4-71976bfca00a	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Reiteralmsee Rundweg (kinderwagentauglich)	\N	outdoor	{family,couple,solo}	[Trail info](https://www.schladming-dachstein.at/en/summer/excursion-mountains/reiteralm-summer)	Minimal drive	family-friendly • chill/relaxing	$$	f	\N	\N	t	5	2025-08-19 10:58:57.43725+02	2025-08-19 10:58:57.43725+02	{"Leichter Rundweg ab Preunegg-Jet um den Reiteralmsee; flach und kinderwagentauglich."}	{clear,partly_cloudy}	Reiteralm Lake Stroller Loop	Easy circular walk from Preunegg Jet around Reiteralm Lake; flat and stroller-friendly.	{}	all	1	12	f	\N	\N	family-friendly • chill/relaxing	Summer	Minimal
49f0f164-35ee-4758-8115-94817e561485	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Alpiner Rundweg Moaralmsee	\N	outdoor	{family,couple,solo}	[Route details](https://www.schladming-dachstein.at/en/regional-and-offerings/tours/Hauser-Kaibling-Moaralmsee-Hans-Wodl-Hutte-Steirischer-Bodensee_td_9999946/)	Significant alpine gain drive	intense/adventure	$$	f	\N	\N	t	6	2025-08-19 10:58:57.438137+02	2025-08-19 10:58:57.438137+02	{"Gipfelwanderung über Hauser Kaibling (2 015 m) mit Panoramablick","Abstieg zum türkisfarbenen Moaralmsee via Weg 45."}	{clear,partly_cloudy}	Moaralmsee Alpine Loop	Scenic summit hike over Hauser Kaibling (2,015 m) with panoramic views, descent to turquoise lake via trail 45.	{}	all	1	12	f	\N	\N	intense/adventure	Summer	Significant alpine gain
4fc1fc8c-97d1-483a-96a7-0821243045e3	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Hopsiland Planai	\N	outdoor	{family,couple,solo}	[Official](https://www.planai.at/en/summer/hopsiland-planai)	Minimal drive	family-friendly • chill/relaxing	$$	f	\N	\N	t	7	2025-08-19 10:58:57.464968+02	2025-08-19 10:58:57.464968+02	{"Höchstgelegener Spielplatz: 1","5 km kinderwagentauglicher Rundweg auf Planai mit Rutschen","Wasserspielen etc."}	{clear,partly_cloudy}	Hopsiland Planai (Playground Trail)	Elevated playground loop with slides, water play, marble runs, lift access — 1.5 km stroller-friendly.	{}	all	1	12	f	\N	\N	family-friendly • chill/relaxing	Summer	Minimal
c5d3535a-df68-4e97-b992-98c36663112a	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Dachstein Skywalk, Suspension Bridge, "Stairway to Nothingness" & Ice Palace	\N	outdoor	{family,couple,solo}	[Official](https://www.derdachstein.at/en/dachstein-glacier-world/glacier-experience/suspension-bridge)	Minimal drive	intense/adventure • all-weather*	$$	f	\N	\N	t	8	2025-08-19 10:58:57.470947+02	2025-08-19 10:58:57.470947+02	{"Gletscher-Attraktionen: Skywalk",Hängebrücke,"gläserne Treppe „ins Nichts“ und Eispalast."}	{clear,partly_cloudy}	Dachstein Skywalk + Ice Palace	Glacier attractions: skywalk, suspension bridge, glass stairway, plus Ice Palace.	{}	all	1	12	f	\N	\N	intense/adventure • all-weather*	Summer (lift deps.)	Minimal
6ff21aa3-516d-4593-a4d9-60d63f96bc94	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Rittisberg Coaster	\N	outdoor	{family,couple,solo}	[Official](https://www.schladming-dachstein.at/en/service/infos-from-a-z/Rittisberg-Coaster-summer-toboggan-run_az_342185)	Minimal drive	family-friendly • chill/relaxing	$$	f	\N	\N	t	9	2025-08-19 10:58:57.481404+02	2025-08-19 10:58:57.481404+02	{1,"3 km Alpen-Coaster mit Spiralen & Steilkurven; bei Sonne oder Regen geöffnet."}	{clear,partly_cloudy}	Rittisberg Coaster (Summer Toboggan)	1.3 km alpine coaster with spirals and banked turns; operates in sun or rain.	{}	all	1	12	f	\N	\N	family-friendly • chill/relaxing	Summer	Minimal
e97ca2b7-2c3d-4eec-a597-a1927d795615	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Erlebnisbad Schladming	\N	outdoor	{family,couple,solo}	[Official](https://erlebnisbad-schladming.at/)	Indoor drive	indoor	$$	f	\N	\N	t	10	2025-08-19 10:58:57.48211+02	2025-08-19 10:58:57.48211+02	{"Hallenbad mit 66 m Rutsche",Kinderbereich,"Sauna & Fitness – ideal bei Regen."}	{clear,partly_cloudy}	Erlebnisbad Schladming	Indoor pool with 66 m slide, kids area, sauna & fitness—perfect for rainy days.	{}	all	1	12	f	\N	\N	indoor	All year	Indoor
f985e31a-98fa-46ad-a9bf-e559ad0248d0	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Erlebnis-Therme	\N	outdoor	{family,couple,solo}	[Official](https://www.thermeamade.at/en/)	Indoor drive	indoor • all-weather	$$	f	\N	\N	t	11	2025-08-19 10:58:57.482571+02	2025-08-19 10:58:57.482571+02	{"Familien-Therme mit Rutschen (inkl. Looping)","Becken & Saunawelt; täglich 09–22 Uhr."}	{clear,partly_cloudy}	Therme Amadé (Altenmarkt)	Spa & water world with slides (incl. loop), pools & saunas; open 09:00–22:00.	{}	all	1	12	f	\N	\N	indoor • all-weather	All year	Indoor
f94ebabc-959b-4c5c-909e-e213eaa15d71	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Abenteuerpark Gröbming	\N	outdoor	{family,couple,solo}	[Official](https://www.abenteuerpark.at/)	Moderate drive	intense/adventure	$$	f	\N	\N	t	12	2025-08-19 10:58:57.484448+02	2025-08-19 10:58:57.484448+02	{"Hochseilpark im Wald: 18–22 Parcours","200+ Stationen; ideal für Familien/Gruppen."}	{clear,partly_cloudy}	Adventure Park Gröbming	Forest high-rope park: 18–22 courses, 200+ stations—great for families/groups.	{}	all	1	12	f	\N	\N	intense/adventure	Summer	Moderate
37b33b7b-14c4-4df9-ba22-6d3e9d71c34a	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Zipline Stoderzinken	\N	outdoor	{family,couple,solo}	[Official](https://www.zipline.at/en)	Minimal drive	intense/adventure	$$	f	\N	\N	t	13	2025-08-19 10:58:57.485565+02	2025-08-19 10:58:57.485565+02	{"Europas Mega-Zipline: 2","5 km","bis ~115 km/h","vier Seile – Adrenalinkick pur."}	{clear,partly_cloudy}	Zipline Stoderzinken	Europe’s mega zipline: 2.5 km, ~115 km/h, four parallel lines—adrenaline rush.	{}	all	1	12	f	\N	\N	intense/adventure	Summer	Minimal
3474b981-993c-44a8-8410-73ca43e2252c	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Tandem-Paragleiten	\N	outdoor	{family,couple,solo}	[Official](https://www.planai.at/en/summer/paragliding)	Minimal drive	intense/adventure	$$	f	\N	\N	t	14	2025-08-19 10:58:57.486098+02	2025-08-19 10:58:57.486098+02	{"Über Schladming schweben mit staatlich geprüften Piloten."}	{clear,partly_cloudy}	Tandem Paragliding	Soar over Schladming with certified pilots.	{}	all	1	12	f	\N	\N	intense/adventure	Summer (weather dep.)	Minimal
54477da2-09b3-467b-9233-de395a26b644	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Ennsradweg	\N	outdoor	{family,couple,solo}	[Official](https://www.schladming-dachstein.at/en/summer/biking/enns-bike-path)	Flat drive	family-friendly	$$	f	\N	\N	t	15	2025-08-19 10:58:57.486574+02	2025-08-19 10:58:57.486574+02	{"Malerischer Flussradweg mit familienfreundlichen Abschnitten durch Täler & Seen."}	{clear,partly_cloudy}	Enns Bike Path	Scenic river bike path with easy family sections through valleys & lakes.	{}	all	1	12	f	\N	\N	family-friendly	Summer	Flat
9a771d90-59f3-4318-a84a-5947e53319ec	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Rafting auf der Enns	\N	outdoor	{family,couple,solo}	[AOS Adventure](https://www.rafting.at/en.html)	Minimal walking drive	intense/adventure	$$	f	\N	\N	t	16	2025-08-19 10:58:57.487027+02	2025-08-19 10:58:57.487027+02	{"Einsteigerfreundliches Wildwasser mit lokalen Guides."}	{clear,partly_cloudy}	Rafting on the Enns	Beginner-friendly white-water rafting with local guides.	{}	all	1	12	f	\N	\N	intense/adventure	Summer	Minimal walking
cbcdff8b-1ebd-4a95-8e0b-9b1369b5711a	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Schladminger Brauerei	\N	outdoor	{family,couple,solo}	[Official](https://www.schladmingerbier.at/)	Indoor drive	chill/relaxing • indoor	$$	f	\N	\N	t	17	2025-08-19 10:58:57.487506+02	2025-08-19 10:58:57.487506+02	{"Regionale „Green Brewery“ mit Shop/Verkostung—ideal bei Regen."}	{clear,partly_cloudy}	Schladming Brewery Tour	Local "green" brewery—visit shop or tasting, great on rainy days.	{}	all	1	12	f	\N	\N	chill/relaxing • indoor	All year	Indoor
79d13a37-84ce-4d95-afa7-ee7e215b295d	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b		Golfclub Schladming-Dachstein	\N	outdoor	{family,couple,solo}	[Official](https://www.schladming-golf.at/en/home/)	Flat/mod drive	chill/relaxing	$$	f	\N	\N	t	18	2025-08-19 10:58:57.488304+02	2025-08-19 10:58:57.488304+02	{"18-Loch-„Pebble Beach der Alpen“: malerisch und sportlich."}	{clear,partly_cloudy}	Golfclub Schladming-Dachstein	18-hole "Pebble Beach of the Alps", picturesque and challenging.	{}	all	1	12	f	\N	\N	chill/relaxing	Summer	Flat/mod
\.


--
-- Data for Name: background_images; Type: TABLE DATA; Schema: public; Owner: alexanderigelsboeck
--

COPY public.background_images (id, property_id, filename, file_path, upload_date, is_active, created_at, updated_at, season, upload_type, title, description, display_order, image_url) FROM stdin;
6	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755511629298-220606975.jpg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755511629298-220606975.jpg	2025-08-18 12:07:09.314166+02	t	2025-08-18 12:07:09.314166+02	2025-08-18 12:07:09.314166+02	summer	upload	\N	\N	0	\N
7	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755511629322-865834569.jpg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755511629322-865834569.jpg	2025-08-18 12:07:09.324777+02	t	2025-08-18 12:07:09.324777+02	2025-08-18 12:07:09.324777+02	summer	upload	\N	\N	0	\N
8	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755511629329-393512190.jpg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755511629329-393512190.jpg	2025-08-18 12:07:09.330386+02	t	2025-08-18 12:07:09.330386+02	2025-08-18 12:07:09.330386+02	summer	upload	\N	\N	0	\N
9	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755511629335-603481786.jpg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755511629335-603481786.jpg	2025-08-18 12:07:09.336574+02	t	2025-08-18 12:07:09.336574+02	2025-08-18 12:07:09.336574+02	summer	upload	\N	\N	0	\N
10	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755511629340-294054831.jpg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755511629340-294054831.jpg	2025-08-18 12:07:09.34138+02	t	2025-08-18 12:07:09.34138+02	2025-08-18 12:07:09.34138+02	summer	upload	\N	\N	0	\N
11	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755513573784-402416975.jpeg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755513573784-402416975.jpeg	2025-08-18 12:39:33.796094+02	t	2025-08-18 12:39:33.796094+02	2025-08-18 12:39:33.796094+02	summer	upload	\N	\N	0	\N
12	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755513573806-794667957.jpg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755513573806-794667957.jpg	2025-08-18 12:39:33.807828+02	t	2025-08-18 12:39:33.807828+02	2025-08-18 12:39:33.807828+02	summer	upload	\N	\N	0	\N
13	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755513573812-256069294.jpg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755513573812-256069294.jpg	2025-08-18 12:39:33.813864+02	t	2025-08-18 12:39:33.813864+02	2025-08-18 12:39:33.813864+02	summer	upload	\N	\N	0	\N
14	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	bg-1755513573818-994155342.jpeg	/uploads/backgrounds/24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b/bg-1755513573818-994155342.jpeg	2025-08-18 12:39:33.819318+02	t	2025-08-18 12:39:33.819318+02	2025-08-18 12:39:33.819318+02	summer	upload	\N	\N	0	\N
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, quantity, price_at_time, options, added_at, updated_at) FROM stdin;
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, property_id, device_name, device_type, mac_address, ip_address, last_seen, software_version, is_online, settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dining_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dining_features (id, dining_id, feature_type, feature_value, created_at) FROM stdin;
709	106	category	Restaurant	2025-08-19 10:59:25.961373
710	106	cuisine	Austrian_Traditional	2025-08-19 10:59:25.961373
711	106	dietary	vegetarian	2025-08-19 10:59:25.961373
712	106	accessibility	Walk	2025-08-19 10:59:25.961373
713	106	accessibility	Car	2025-08-19 10:59:25.961373
714	106	season	Year_Round	2025-08-19 10:59:25.961373
715	107	category	Fine_Dining	2025-08-19 10:59:25.961373
716	107	cuisine	Modern_Styrian	2025-08-19 10:59:25.961373
717	107	dietary	vegetarian	2025-08-19 10:59:25.961373
718	107	dietary	vegan	2025-08-19 10:59:25.961373
719	107	dietary	gluten_free	2025-08-19 10:59:25.961373
720	107	accessibility	Walk	2025-08-19 10:59:25.961373
721	107	accessibility	Car	2025-08-19 10:59:25.961373
722	107	season	Year_Round	2025-08-19 10:59:25.961373
723	108	category	Fine_Dining	2025-08-19 10:59:25.961373
724	108	cuisine	Austrian_European_Asian	2025-08-19 10:59:25.961373
725	108	dietary	vegetarian	2025-08-19 10:59:25.961373
726	108	dietary	vegan	2025-08-19 10:59:25.961373
727	108	dietary	gluten_free	2025-08-19 10:59:25.961373
728	108	accessibility	Walk	2025-08-19 10:59:25.961373
729	108	accessibility	Car	2025-08-19 10:59:25.961373
730	108	season	Year_Round	2025-08-19 10:59:25.961373
731	109	category	Restaurant	2025-08-19 10:59:25.961373
732	109	cuisine	Mediterranean_Austrian	2025-08-19 10:59:25.961373
733	109	dietary	vegetarian	2025-08-19 10:59:25.961373
734	109	dietary	vegan	2025-08-19 10:59:25.961373
735	109	dietary	gluten_free	2025-08-19 10:59:25.961373
736	109	accessibility	Walk	2025-08-19 10:59:25.961373
737	109	accessibility	Car	2025-08-19 10:59:25.961373
738	109	season	Year_Round	2025-08-19 10:59:25.961373
739	110	category	Cafe_Bakery	2025-08-19 10:59:25.961373
740	110	cuisine	International_Local	2025-08-19 10:59:25.961373
741	110	dietary	vegetarian	2025-08-19 10:59:25.961373
742	110	dietary	vegan	2025-08-19 10:59:25.961373
743	110	dietary	gluten_free	2025-08-19 10:59:25.961373
744	110	accessibility	Walk	2025-08-19 10:59:25.961373
745	110	accessibility	Car	2025-08-19 10:59:25.961373
746	110	season	Year_Round	2025-08-19 10:59:25.961373
747	111	category	Mountain_Hut	2025-08-19 10:59:25.961373
748	111	cuisine	Traditional_Styrian	2025-08-19 10:59:25.961373
749	111	dietary	vegetarian	2025-08-19 10:59:25.961373
750	111	accessibility	Cable_Car	2025-08-19 10:59:25.961373
751	111	season	Winter_Primary	2025-08-19 10:59:25.961373
752	112	category	Mountain_Hut	2025-08-19 10:59:25.961373
753	112	cuisine	Pizza_Traditional	2025-08-19 10:59:25.961373
754	112	dietary	vegetarian	2025-08-19 10:59:25.961373
755	112	dietary	vegan	2025-08-19 10:59:25.961373
756	112	dietary	gluten_free	2025-08-19 10:59:25.961373
757	112	accessibility	Cable_Car	2025-08-19 10:59:25.961373
758	112	accessibility	Hike	2025-08-19 10:59:25.961373
759	112	season	Year_Round	2025-08-19 10:59:25.961373
760	113	category	Mountain_Hut	2025-08-19 10:59:25.961373
761	113	cuisine	Traditional_Farm	2025-08-19 10:59:25.961373
762	113	dietary	vegetarian	2025-08-19 10:59:25.961373
763	113	accessibility	Cable_Car	2025-08-19 10:59:25.961373
764	113	accessibility	Hike	2025-08-19 10:59:25.961373
765	113	season	Winter_Primary	2025-08-19 10:59:25.961373
766	114	category	Apres_Ski	2025-08-19 10:59:25.961373
767	114	cuisine	Traditional_Party	2025-08-19 10:59:25.961373
768	114	dietary	vegetarian	2025-08-19 10:59:25.961373
769	114	accessibility	Walk	2025-08-19 10:59:25.961373
770	114	accessibility	Car	2025-08-19 10:59:25.961373
771	114	season	Winter_Primary	2025-08-19 10:59:25.961373
772	115	category	Mountain_Hut	2025-08-19 10:59:25.961373
773	115	cuisine	Traditional_Austrian	2025-08-19 10:59:25.961373
774	115	dietary	vegetarian	2025-08-19 10:59:25.961373
775	115	accessibility	Cable_Car	2025-08-19 10:59:25.961373
776	115	accessibility	Hike	2025-08-19 10:59:25.961373
777	115	season	Year_Round	2025-08-19 10:59:25.961373
778	116	category	Mountain_Hut	2025-08-19 10:59:25.961373
779	116	cuisine	Traditional_Hut	2025-08-19 10:59:25.961373
780	116	dietary	vegetarian	2025-08-19 10:59:25.961373
781	116	accessibility	Cable_Car	2025-08-19 10:59:25.961373
782	116	accessibility	Hike	2025-08-19 10:59:25.961373
783	116	season	Year_Round	2025-08-19 10:59:25.961373
784	117	category	Gourmet_Hut	2025-08-19 10:59:25.961373
785	117	cuisine	Gourmet_Regional	2025-08-19 10:59:25.961373
786	117	dietary	vegetarian	2025-08-19 10:59:25.961373
787	117	dietary	vegan	2025-08-19 10:59:25.961373
788	117	dietary	gluten_free	2025-08-19 10:59:25.961373
789	117	accessibility	Cable_Car	2025-08-19 10:59:25.961373
790	117	season	Winter_Primary	2025-08-19 10:59:25.961373
791	118	category	Apres_Ski	2025-08-19 10:59:25.961373
792	118	cuisine	Modern_Alpine	2025-08-19 10:59:25.961373
793	118	dietary	vegetarian	2025-08-19 10:59:25.961373
794	118	dietary	vegan	2025-08-19 10:59:25.961373
795	118	dietary	gluten_free	2025-08-19 10:59:25.961373
796	118	accessibility	Walk	2025-08-19 10:59:25.961373
797	118	accessibility	Car	2025-08-19 10:59:25.961373
798	118	season	Winter_Only	2025-08-19 10:59:25.961373
799	119	category	Alpine_Hut	2025-08-19 10:59:25.961373
800	119	cuisine	Cafe_Traditional	2025-08-19 10:59:25.961373
801	119	dietary	vegetarian	2025-08-19 10:59:25.961373
802	119	dietary	vegan	2025-08-19 10:59:25.961373
803	119	accessibility	Car	2025-08-19 10:59:25.961373
804	119	accessibility	Bike	2025-08-19 10:59:25.961373
805	119	accessibility	Bus	2025-08-19 10:59:25.961373
806	119	season	Summer_Only	2025-08-19 10:59:25.961373
807	120	category	Alpine_Hut	2025-08-19 10:59:25.961373
808	120	cuisine	Traditional_Styrian	2025-08-19 10:59:25.961373
809	120	dietary	vegetarian	2025-08-19 10:59:25.961373
810	120	accessibility	Cable_Car	2025-08-19 10:59:25.961373
811	120	accessibility	Hike	2025-08-19 10:59:25.961373
812	120	season	Year_Round	2025-08-19 10:59:25.961373
813	121	category	Alpine_Hut	2025-08-19 10:59:25.961373
814	121	cuisine	Traditional_Vegetarian	2025-08-19 10:59:25.961373
815	121	dietary	vegetarian	2025-08-19 10:59:25.961373
816	121	dietary	vegan	2025-08-19 10:59:25.961373
817	121	dietary	gluten_free	2025-08-19 10:59:25.961373
818	121	accessibility	Hike	2025-08-19 10:59:25.961373
819	121	season	Summer_Only	2025-08-19 10:59:25.961373
820	122	category	Fine_Dining	2025-08-19 10:59:25.961373
821	122	cuisine	Innovative_Natural_Wine	2025-08-19 10:59:25.961373
822	122	dietary	vegetarian	2025-08-19 10:59:25.961373
823	122	dietary	vegan	2025-08-19 10:59:25.961373
824	122	dietary	gluten_free	2025-08-19 10:59:25.961373
825	122	accessibility	Car	2025-08-19 10:59:25.961373
826	122	season	Year_Round	2025-08-19 10:59:25.961373
827	123	category	Apres_Ski_Mega	2025-08-19 10:59:25.961373
828	123	cuisine	Austrian_Party	2025-08-19 10:59:25.961373
829	123	dietary	vegetarian	2025-08-19 10:59:25.961373
830	123	accessibility	Walk	2025-08-19 10:59:25.961373
831	123	accessibility	Car	2025-08-19 10:59:25.961373
832	123	accessibility	Bus	2025-08-19 10:59:25.961373
833	123	season	Winter_Primary	2025-08-19 10:59:25.961373
834	124	category	Hotel_Restaurant	2025-08-19 10:59:25.961373
835	124	cuisine	Austrian_Ayurvedic	2025-08-19 10:59:25.961373
836	124	dietary	vegetarian	2025-08-19 10:59:25.961373
837	124	dietary	vegan	2025-08-19 10:59:25.961373
838	124	dietary	gluten_free	2025-08-19 10:59:25.961373
839	124	accessibility	Walk	2025-08-19 10:59:25.961373
840	124	accessibility	Car	2025-08-19 10:59:25.961373
841	124	season	Year_Round	2025-08-19 10:59:25.961373
842	125	category	Alpine_Hut	2025-08-19 10:59:25.961373
843	125	cuisine	Traditional_Austrian	2025-08-19 10:59:25.961373
844	125	dietary	vegetarian	2025-08-19 10:59:25.961373
845	125	accessibility	Car	2025-08-19 10:59:25.961373
846	125	accessibility	Hike	2025-08-19 10:59:25.961373
847	125	accessibility	Bus	2025-08-19 10:59:25.961373
848	125	season	Summer_Primary	2025-08-19 10:59:25.961373
849	126	category	Alpine_Hut	2025-08-19 10:59:25.961373
850	126	cuisine	Traditional	2025-08-19 10:59:25.961373
851	126	dietary	vegetarian	2025-08-19 10:59:25.961373
852	126	accessibility	Car	2025-08-19 10:59:25.961373
853	126	accessibility	Hike	2025-08-19 10:59:25.961373
854	126	season	Summer_Primary	2025-08-19 10:59:25.961373
855	127	category	Mountain_Hut	2025-08-19 10:59:25.961373
856	127	cuisine	Traditional_Vegetarian	2025-08-19 10:59:25.961373
857	127	dietary	vegetarian	2025-08-19 10:59:25.961373
858	127	dietary	vegan	2025-08-19 10:59:25.961373
859	127	dietary	gluten_free	2025-08-19 10:59:25.961373
860	127	accessibility	Cable_Car	2025-08-19 10:59:25.961373
861	127	accessibility	Hike	2025-08-19 10:59:25.961373
862	127	season	Year_Round	2025-08-19 10:59:25.961373
863	128	category	Mountain_Hut	2025-08-19 10:59:25.961373
864	128	cuisine	Traditional	2025-08-19 10:59:25.961373
865	128	dietary	vegetarian	2025-08-19 10:59:25.961373
866	128	accessibility	Cable_Car	2025-08-19 10:59:25.961373
867	128	accessibility	Hike	2025-08-19 10:59:25.961373
868	128	season	Winter_Primary	2025-08-19 10:59:25.961373
869	129	category	Restaurant	2025-08-19 10:59:25.961373
870	129	cuisine	Traditional_Styrian	2025-08-19 10:59:25.961373
871	129	dietary	vegetarian	2025-08-19 10:59:25.961373
872	129	accessibility	Car	2025-08-19 10:59:25.961373
873	129	accessibility	Bus	2025-08-19 10:59:25.961373
874	129	season	Year_Round	2025-08-19 10:59:25.961373
875	130	category	Mountain_Refuge	2025-08-19 10:59:25.961373
876	130	cuisine	Traditional_Alpine	2025-08-19 10:59:25.961373
877	130	dietary	vegetarian	2025-08-19 10:59:25.961373
878	130	accessibility	Hike_Only	2025-08-19 10:59:25.961373
879	130	season	Summer_Only	2025-08-19 10:59:25.961373
880	131	category	Alpine_Hut	2025-08-19 10:59:25.961373
881	131	cuisine	Traditional_Organic	2025-08-19 10:59:25.961373
882	131	dietary	vegetarian	2025-08-19 10:59:25.961373
883	131	dietary	vegan	2025-08-19 10:59:25.961373
884	131	dietary	gluten_free	2025-08-19 10:59:25.961373
885	131	accessibility	Hike	2025-08-19 10:59:25.961373
886	131	accessibility	Bike	2025-08-19 10:59:25.961373
887	131	season	Summer_Only	2025-08-19 10:59:25.961373
888	132	category	Alpine_Hut	2025-08-19 10:59:25.961373
889	132	cuisine	Traditional_Farm	2025-08-19 10:59:25.961373
890	132	dietary	vegetarian	2025-08-19 10:59:25.961373
891	132	dietary	vegan	2025-08-19 10:59:25.961373
892	132	accessibility	Hike	2025-08-19 10:59:25.961373
893	132	accessibility	E-Bike	2025-08-19 10:59:25.961373
894	132	season	Summer_Only	2025-08-19 10:59:25.961373
895	133	category	Mountain_Hut	2025-08-19 10:59:25.961373
896	133	cuisine	Traditional_BBQ	2025-08-19 10:59:25.961373
897	133	dietary	vegetarian	2025-08-19 10:59:25.961373
898	133	accessibility	Cable_Car	2025-08-19 10:59:25.961373
899	133	accessibility	Hike	2025-08-19 10:59:25.961373
900	133	season	Year_Round	2025-08-19 10:59:25.961373
901	134	category	Mountain_Restaurant	2025-08-19 10:59:25.961373
902	134	cuisine	Austrian_International	2025-08-19 10:59:25.961373
903	134	dietary	vegetarian	2025-08-19 10:59:25.961373
904	134	dietary	vegan	2025-08-19 10:59:25.961373
905	134	dietary	gluten_free	2025-08-19 10:59:25.961373
906	134	accessibility	Cable_Car	2025-08-19 10:59:25.961373
907	134	season	Year_Round	2025-08-19 10:59:25.961373
908	135	category	Mountain_Inn	2025-08-19 10:59:25.961373
909	135	cuisine	Traditional_Game	2025-08-19 10:59:25.961373
910	135	dietary	vegetarian	2025-08-19 10:59:25.961373
911	135	accessibility	Car	2025-08-19 10:59:25.961373
912	135	accessibility	Hike	2025-08-19 10:59:25.961373
913	135	season	Summer_Primary	2025-08-19 10:59:25.961373
914	136	category	Alpine_Hut	2025-08-19 10:59:25.961373
915	136	cuisine	Traditional_Dairy	2025-08-19 10:59:25.961373
916	136	dietary	vegetarian	2025-08-19 10:59:25.961373
917	136	accessibility	Car_Toll	2025-08-19 10:59:25.961373
918	136	accessibility	Hike	2025-08-19 10:59:25.961373
919	136	season	Summer_Only	2025-08-19 10:59:25.961373
920	137	category	Alpine_Hut	2025-08-19 10:59:25.961373
921	137	cuisine	Traditional_Austrian	2025-08-19 10:59:25.961373
922	137	dietary	vegetarian	2025-08-19 10:59:25.961373
923	137	accessibility	Hike	2025-08-19 10:59:25.961373
924	137	accessibility	Ski_Tour	2025-08-19 10:59:25.961373
925	137	season	Summer_Primary	2025-08-19 10:59:25.961373
926	138	category	Mountain_Hut	2025-08-19 10:59:25.961373
927	138	cuisine	Traditional_Snacks	2025-08-19 10:59:25.961373
928	138	dietary	vegetarian	2025-08-19 10:59:25.961373
929	138	accessibility	Hike	2025-08-19 10:59:25.961373
930	138	season	Summer_Only	2025-08-19 10:59:25.961373
931	139	category	Mountain_Hut	2025-08-19 10:59:25.961373
932	139	cuisine	Traditional_Comfort	2025-08-19 10:59:25.961373
933	139	dietary	vegetarian	2025-08-19 10:59:25.961373
934	139	dietary	vegan	2025-08-19 10:59:25.961373
935	139	accessibility	Cable_Car	2025-08-19 10:59:25.961373
936	139	accessibility	Hike	2025-08-19 10:59:25.961373
937	139	season	Year_Round	2025-08-19 10:59:25.961373
938	140	category	Mountain_Restaurant	2025-08-19 10:59:25.961373
939	140	cuisine	Modern_Alpine	2025-08-19 10:59:25.961373
940	140	dietary	vegetarian	2025-08-19 10:59:25.961373
941	140	dietary	vegan	2025-08-19 10:59:25.961373
942	140	dietary	gluten_free	2025-08-19 10:59:25.961373
943	140	accessibility	Cable_Car	2025-08-19 10:59:25.961373
944	140	season	Winter_Only	2025-08-19 10:59:25.961373
\.


--
-- Data for Name: dining_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dining_hours (id, dining_id, season, day_of_week, open_time, close_time, is_closed, notes, created_at) FROM stdin;
\.


--
-- Data for Name: dining_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dining_options (id, external_id, name_de, name_en, category, location_area, street_address, postal_code, city, altitude_m, phone, website, email, hours_winter, hours_summer, cuisine_type, price_range, capacity_indoor, capacity_outdoor, capacity_total, awards, accessibility, parking, family_friendly, vegetarian, vegan, gluten_free, reservations_required, season_recommendation, relevance_status, image_url, latitude, longitude, is_active, created_at, updated_at, last_imported, access_by_car, access_by_cable_car, access_by_hiking, access_by_bike, access_by_lift, access_by_public_transport, access_difficulty, access_time_minutes, access_notes, event_type, atmosphere, target_guest_types) FROM stdin;
106	001	Stadtbräu Schladming	Stadtbräu Schladming	Restaurant	Town_Center	Siedergasse 89	8970	Schladming	750	+43 664 517 96 20	stadtbraeu-schladming.at	\N	Daily 11:00-22:30	Daily 11:30-20:30	Austrian_Traditional	2	88	60	148	\N	Walk,Car	t	t	t	f	f	Recommended	Year_Round	Popular	https://cdn.schladming-dachstein.at/stadtbraeu/exterior-courtyard-summer.jpg	47.394700	13.687500	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
107	002	JOHANN GENUSSraum	JOHANN GENUSSraum Restaurant	Fine_Dining	Town_Center	Hauptplatz 10	8970	Schladming	750	+43 3687 22571	johann-schladming.at	\N	Daily 17:30-21:30	Daily 17:30-21:30	Modern_Styrian	4	60	30	90	2_Gault_Millau	Walk,Car	f	f	t	t	t	Yes	Year_Round	Must_See	https://cdn.johann-schladming.at/restaurant/genussraum-interior-elegant.jpg	47.394200	13.687200	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
108	003	Die Tischlerei	Restaurant die tischlerei	Fine_Dining	Town_Center	Roseggerstraße 676	8970	Schladming	750	+43 3687 22192	dietischlerei.co.at	\N	Varies	Varies	Austrian_European_Asian	4	50	20	70	90_Falstaff	Walk,Car	t	f	t	t	t	Yes	Year_Round	Highly_Recommended	https://images.falstaff.com/tischlerei/modern-dining-room-2024.jpg	47.395500	13.689000	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
109	004	Das Friedrich	Restaurant das Friedrich	Restaurant	Town_Center	Stadtzentrum	8970	Schladming	750	\N	das-friedrich.at	\N	Daily	Daily	Mediterranean_Austrian	3	80	40	120	\N	Walk,Car	t	f	t	t	t	Recommended	Year_Round	Recommended	https://cdn.das-friedrich.at/restaurant/mediterranean-terrace-view.jpg	47.394500	13.687300	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
110	005	ARTiSAN	ARTiSAN Café.Restaurant	Cafe_Bakery	Town_Center	Erzherzog Johann Straße 248A	8970	Schladming	750	+43 3687 23038	artisan-schladming.at	\N	Mon-Fri 8:00-15:00, Sat 8:00-12:00	Mon-Fri 8:00-15:00, Sat 8:00-12:00	International_Local	2	40	20	60	\N	Walk,Car	t	t	t	t	t	No	Year_Round	Popular	https://media.artisan-schladming.at/cafe/bakery-interior-books-games.jpg	47.396000	13.688500	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
111	006	Schladminger Hütte	Schladminger Hütte	Mountain_Hut	Planai_Summit	Planai Gipfel	8970	Schladming	1830	\N	schladmingerhuette.at	\N	Ski_Season	21.06-02.11, 9:00-17:00	Traditional_Styrian	2	100	150	250	Genuss_Specht	Cable_Car	f	t	t	f	f	No	Winter_Primary	Must_See	https://cdn.planai.at/huetten/schladminger-huette-panorama-winter.jpg	47.378900	13.676400	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
112	007	Schafalm	Schafalm	Mountain_Hut	Planai	Planai	8970	Schladming	1800	\N	schafalm.at	\N	Ski_Season	Year_Round	Pizza_Traditional	2	80	100	180	\N	Cable_Car,Hike	f	t	t	t	t	Recommended	Year_Round	Highly_Recommended	https://media.schafalm.at/gallery/stone-oven-pizza-terrace.jpg	47.379200	13.677000	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
113	008	Märchenwiesenhütte	Märchenwiesenhütte	Mountain_Hut	Planai_Hopsiland	Märchenwiese	8970	Schladming	1500	+43 664 42 33 823	maerchenwiesenhuette.at	\N	Ski_Season	Summer_Season	Traditional_Farm	2	150	150	300	\N	Cable_Car,Hike	f	t	t	f	f	Groups	Winter_Primary	Popular	https://cdn.planai.at/hopsiland/maerchenwiese-family-sunny-terrace.jpg	47.385000	13.680000	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
114	009	Platzhirsch Alm	Platzhirsch Alm	Apres_Ski	Planai_Base	Coburgstraße 626	8970	Schladming	800	+43 664 18 41 514	platzhirsch.cc	\N	Ski_Season	Mon,Wed,Thu 11:00-22:00, Fri-Sat 11:00-23:00	Traditional_Party	2	200	150	350	\N	Walk,Car	t	f	t	f	f	Groups	Winter_Primary	Must_See	https://media.platzhirsch.cc/gallery/apres-ski-party-crowd-2024.jpg	47.389500	13.683200	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
115	010	Hochwurzenhütte	Hochwurzenhütte	Mountain_Hut	Hochwurzen_Summit	Hochwurzen Gipfel	8971	Rohrmoos	1852	+43 3687 61177	hochwurzen.at	\N	Ski_Season	29.05-12.10, 9:00-17:00	Traditional_Austrian	2	60	80	140	\N	Cable_Car,Hike	f	t	t	f	f	Recommended	Year_Round	Highly_Recommended	https://cdn.hochwurzen.at/huette/summit-360-panorama-view.jpg	47.365800	13.712300	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
116	011	Gasselhöh Hütte	Gasselhöh Hütte	Mountain_Hut	Reiteralm	Reiteralm	8973	Pichl	1750	+43 664 45 13 435	gasselhoehhuette.at	\N	Ski_Season	Summer_Season	Traditional_Hut	2	50	60	110	\N	Cable_Car,Hike	f	t	t	f	f	No	Year_Round	Recommended	https://media.reiteralm.at/huetten/gasselhoeh-lake-view-summer.jpg	47.345600	13.623400	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
117	012	Krummholzhütte	Krummholzhütte	Gourmet_Hut	Hauser_Kaibling	Hauser Kaibling	8967	Haus	1857	+43 3686 2317	krummholzhuette.at	\N	Ski_Season	Summer_Season	Gourmet_Regional	4	80	100	180	1_GenussHütte	Cable_Car	f	f	t	t	t	Yes	Winter_Primary	Must_See	https://cdn.hauser-kaibling.at/krummholz/gourmet-alpine-luxury.jpg	47.412300	13.745600	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
118	013	AlmArenA	AlmArenA	Apres_Ski	Hauser_Kaibling_Base	Talstation Hauser Kaibling	8967	Haus	750	+43 3686 20060	almarena.at	\N	Ski_Season	Closed	Modern_Alpine	3	800	700	1500	\N	Walk,Car	t	f	t	t	t	Groups	Winter_Only	Highly_Recommended	https://media.almarena.at/venue/mega-party-venue-lights.jpg	47.409800	13.742300	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
119	014	Eschachalm	Eschachalm	Alpine_Hut	Obertal	Ende Obertalstraße	8971	Schladming	1350	+43 664 10 44 838	eiblhof.at	\N	Closed	01.06-30.09, from 11:00	Cafe_Traditional	1	40	60	100	Richard_Rauch_Partner	Car,Bike,Bus	t	t	t	t	f	No	Summer_Only	Popular	https://cdn.obertal.at/eschachalm/alpine-meadow-traditional-hut.jpg	47.323400	13.678900	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
120	015	Sonnenalm	Die Sonnenalm	Alpine_Hut	Rittisberg	Ramsau am Dachstein	8972	Ramsau	1350	\N	die-sonnenalm.at	\N	Ski_Season	Summer_Season	Traditional_Styrian	2	60	80	140	\N	Cable_Car,Hike	f	t	t	f	f	Recommended	Year_Round	Popular	https://media.sonnenalm.at/gallery/kaiserschmarrn-sunny-terrace.jpg	47.423400	13.656700	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
121	016	Brandalm	Brandalm	Alpine_Hut	Dachstein	Fuß des Dachsteins	8972	Ramsau	1600	+43 664 1806460	brandalm.at	\N	Closed	Summer_Season	Traditional_Vegetarian	1	40	50	90	\N	Hike	f	t	t	t	t	No	Summer_Only	Recommended	https://cdn.dachstein.at/brandalm/dachstein-backdrop-alpine-hut.jpg	47.456700	13.623400	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
122	017	ARX Restaurant	ARX Restaurant	Fine_Dining	Rohrmoos	Rohrmoosstraße 91	8971	Rohrmoos	900	+43 3687 61493	\N	\N	Wed-Sat 15:00-22:30	Wed-Sat 15:00-22:30	Innovative_Natural_Wine	3	45	20	65	1_Gault_Millau	Car	t	f	t	t	t	Yes	Year_Round	Highly_Recommended	https://media.gaultmillau.at/arx/modern-alpine-interior-2024.jpg	47.376500	13.701200	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
123	018	Hohenhaus Tenne	Hohenhaus Tenne	Apres_Ski_Mega	Planai_Base	Coburgstraße 512	8970	Schladming	800	+43 3687 22100	tenne.com	\N	Ski_Season_Extended	Limited	Austrian_Party	2	96	60	3000	Europes_Largest	Walk,Car,Bus	t	f	t	f	f	Groups	Winter_Primary	Must_See	https://cdn.tenne.com/schladming/europes-largest-apres-ski-venue.jpg	47.390100	13.684500	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
124	019	Brunners Gasthaus	Brunners Gasthaus	Hotel_Restaurant	Town_Center	Hauptplatz	8970	Schladming	750	+43 3687 22318	stadthotel-brunner.at	\N	Daily	Daily	Austrian_Ayurvedic	3	70	30	100	\N	Walk,Car	f	f	t	t	t	Recommended	Year_Round	Recommended	https://cdn.stadthotel-brunner.at/restaurant/elegant-hotel-dining.jpg	47.394300	13.687100	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
125	020	Waldhäuslalm	Waldhäuslalm	Alpine_Hut	Untertal	Untertal	8971	Schladming	1100	+43 3687 22177	waldhaeuslalm.at	\N	Daily	Daily	Traditional_Austrian	2	120	150	270	\N	Car,Hike,Bus	t	t	t	f	f	Groups	Summer_Primary	Popular	https://media.waldhaeuslalm.at/venue/family-alpine-playground-view.jpg	47.334500	13.645600	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
126	021	Kessler Alm	Kessler Alm	Alpine_Hut	Planai	Planaistraße	8970	Schladming	950	\N	\N	\N	Seasonal	Seasonal	Traditional	2	50	70	120	\N	Car,Hike	f	t	t	f	f	No	Summer_Primary	Worth_Visiting	https://cdn.planai.at/almen/kessler-alm-traditional-wooden.jpg	47.382300	13.679800	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
127	022	Onkel Willy's Hütte	Onkel Willy's Hütte	Mountain_Hut	Rohrmoos	Rohrmoos-Untertal	8971	Rohrmoos	1200	\N	\N	\N	Ski_Season	Summer_Season	Traditional_Vegetarian	2	60	80	140	\N	Cable_Car,Hike	f	t	t	t	t	Recommended	Year_Round	Popular	https://cdn.rohrmoos.at/huetten/onkel-willys-cozy-atmosphere.jpg	47.371200	13.708900	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
128	023	Weitmoosalm	Weitmoosalm	Mountain_Hut	Planai	Planai	8970	Schladming	1650	\N	weitmoosalm.at	\N	Ski_Season	Summer_Season	Traditional	2	70	90	160	\N	Cable_Car,Hike	f	t	t	f	f	No	Winter_Primary	Recommended	https://media.planai.at/weitmoosalm/ski-slope-mountain-restaurant.jpg	47.380100	13.677800	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
129	024	Landalm	Landalm	Restaurant	Untertal	Untertal	8971	Schladming	900	+43 3687 61573	landalm.at	\N	Daily	Daily	Traditional_Styrian	2	90	110	200	\N	Car,Bus	t	t	t	f	f	Recommended	Year_Round	Recommended	https://cdn.landalm.at/restaurant/rustic-styrian-dining-hall.jpg	47.336700	13.647800	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
130	025	Ignaz-Mattis-Hütte	Ignaz-Mattis-Hütte	Mountain_Refuge	Giglachsee	Giglachsee	8971	Schladming	1986	+43 664 9158589	\N	\N	Closed_Winter	June-October	Traditional_Alpine	2	45	30	75	Alpine_Club	Hike_Only	f	f	t	f	f	Yes	Summer_Only	Worth_Visiting	https://cdn.alpenverein.at/huetten/ignaz-mattis-giglachsee-refuge.jpg	47.278900	13.623400	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
131	026	Moarhofalm	Moarhofalm	Alpine_Hut	Obertal	Hopfriesen	8971	Schladming	1520	+43 664 4535878	moarhofalm.at	\N	Closed	Mid_May-Mid_Oct, 10:00-18:00	Traditional_Organic	2	45	80	125	Bio_Certified	Hike,Bike	t	t	t	t	t	No	Summer_Only	Must_See	https://cdn.obertal.at/moarhofalm/authentic-alpine-farm-panorama.jpg	47.315600	13.690100	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
132	027	Lärchbodenalm	Lärchbodenalm	Alpine_Hut	Untertal	Untertal	8971	Schladming	1420	+43 664 2141429	laerchbodenalm.at	\N	Closed	May-October, 10:00-17:00	Traditional_Farm	1	40	60	100	\N	Hike,E-Bike	t	t	t	t	f	No	Summer_Only	Highly_Recommended	https://media.untertal.at/laerchbodenalm/mountain-meadow-terrace.jpg	47.328900	13.652300	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
133	028	Sattelberghütte	Sattelberghütte	Mountain_Hut	Planai	Planai Mittelstation	8970	Schladming	1670	+43 676 7506365	sattelberghuette.at	\N	Ski_Season	Summer_Season	Traditional_BBQ	2	60	100	160	\N	Cable_Car,Hike	f	t	t	f	f	Groups	Year_Round	Popular	https://cdn.planai.at/sattelberghuette/sunny-terrace-bbq-smoke.jpg	47.381200	13.678900	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
134	029	Planaihof	Planaihof	Mountain_Restaurant	Planai	Planai Bergstation	8970	Schladming	1800	+43 3687 22042	planaihof.at	\N	Ski_Season	Summer_Season	Austrian_International	3	120	180	300	\N	Cable_Car	f	t	t	t	t	Recommended	Year_Round	Highly_Recommended	https://media.planai.at/planaihof/modern-mountain-restaurant-view.jpg	47.379500	13.677200	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
135	030	Berggasthof Scharfetter	Scharfetter	Mountain_Inn	Planai	Fastenberg	8970	Schladming	1100	+43 3687 22264	berggasthof-scharfetter.at	\N	Closed	May-October, Daily 9:00-19:00	Traditional_Game	2	70	90	160	\N	Car,Hike	t	t	t	f	f	Recommended	Summer_Primary	Recommended	https://cdn.fastenberg.at/scharfetter/traditional-mountain-inn.jpg	47.372300	13.681200	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
136	031	Ursprungalm	Ursprungalm	Alpine_Hut	Preuneggtal	Preuneggtal	8971	Schladming	1600	+43 664 9184522	ursprungalm.at	\N	Closed	June-September, 10:00-18:00	Traditional_Dairy	1	30	50	80	Alpine_Cheese_Award	Car_Toll,Hike	t	t	t	f	f	No	Summer_Only	Must_See	https://media.preuneggtal.at/ursprungalm/alpine-dairy-farm-authentic.jpg	47.304500	13.723400	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
137	032	Neualm	Neualm	Alpine_Hut	Dachstein	Ramsau	8972	Ramsau	1308	+43 3687 81776	neualm.at	\N	Winter_Weekends	May-October, Daily	Traditional_Austrian	2	50	70	120	\N	Hike,Ski_Tour	f	t	t	f	f	Groups	Summer_Primary	Recommended	https://cdn.ramsau.at/neualm/cozy-wooden-hut-dachstein.jpg	47.412300	13.645600	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
138	033	Hopfriesen Hütte	Hopfriesen Hütte	Mountain_Hut	Obertal	Hopfriesen	8971	Schladming	1340	+43 664 1234567	\N	\N	Closed	June-September, 10:00-17:00	Traditional_Snacks	1	25	40	65	\N	Hike	f	t	t	f	f	No	Summer_Only	Worth_Visiting	https://media.obertal.at/hopfriesen/small-traditional-hut.jpg	47.320100	13.688900	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
139	034	Anderl Hütte	Anderl-Hütte	Mountain_Hut	Hochwurzen	Hochwurzen	8971	Rohrmoos	1420	+43 664 3456789	anderl-huette.at	\N	Ski_Season	Summer_Season	Traditional_Comfort	2	55	75	130	\N	Cable_Car,Hike	f	t	t	t	f	No	Year_Round	Popular	https://cdn.hochwurzen.at/anderl/comfort-food-mountain-hut.jpg	47.368900	13.714500	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
140	035	Hochsitz	Hochsitz	Mountain_Restaurant	Hochwurzen	Hochwurzen Mittelstation	8971	Rohrmoos	1300	+43 3687 61188	hochsitz-hochwurzen.at	\N	Ski_Season	Closed	Modern_Alpine	3	90	120	210	Design_Award	Cable_Car	f	f	t	t	t	Recommended	Winter_Only	Highly_Recommended	https://media.hochwurzen.at/hochsitz/architectural-mountain-design.jpg	47.367500	13.713400	t	2025-08-19 10:59:25.961373	2025-08-19 10:59:25.961373	2025-01-01	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: dining_places; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dining_places (id, name, description, cuisine_type, price_range, location, address, phone, website, opening_hours, rating, image_url, is_featured, is_active, reservation_required, reservation_url, tags, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dining_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dining_reviews (id, dining_id, guest_name, rating, review, visit_date, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: alexanderigelsboeck
--

COPY public.events (id, external_id, name, description, location, start_date, end_date, image_url, source_url, category, is_featured, is_active, price_info, contact_info, created_at, updated_at, season, season_start_month, season_end_month, weather_dependent, min_temperature, max_temperature) FROM stdin;
37	schladming_ev_23167121	Von der Kuh zum Käse - Käsereiführung	Käsemeister: Martin Pötsch\nOrt: Bauernhof und Käserei Hüttstädterhof\nKursbeitrag: € 5 pro Person\n\nBei dieser Führung bekommt man Einblicke in die Käse Herstellung. Die Kühe mit ausschließlich weiblicher Nachzucht liefern die wertvolle Milche, welche Martin Pötsch zu feinen Schnitt- und Hartkäse Sorten veredelt. Dabei spielen der Rohstoff Milch, frei von Konservierungsstoffen, und die weitere Verarbeitung eine wesentliche Rolle. Es wird zu Abschluss gemeinsam verkostet. Im Hofladen können die Lieblingssorten auch für zuhause erworben werden.\n\nAnmeldung 14.07: klicke hier\nAnmeldung 18.08: klicke hier\n\n(Weekly event - please check website for exact dates)	Bauernhof und Käserei Hüttstädterhof	2025-08-26 14:00:00	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMSIgdmlld0JveD0iMCAwIDQwMCAzMDEiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRXRBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFRQUNBLy9FQUNjUUFRRUJBQUlCQkFJQ0F3RUJBUUFBQUFBQkVTRXhBaEpCVVhGaGtZSFJzZkR4NFNMQi84UUFGZ0VCQVFFQUFBQUFBQUFBQUFBQUFBQUFBQUVDLzhRQUdCRUJBUUVCQVFBQUFBQUFBQUFBQUFBQUFBRVJNU0gvMmdBTUF3RUFBaEVERVFBL0FPWkJCSklFa2dTU0JKSUR0Lzd5dGw3bjZDQS9WL2ZDNTl3ZHNCV2c4ZTgvWDlMUGpuL1A2QlFqMi9KMUFYVitEbTlBRWFFQ2g5SWgzQU45aE1QR2NzNkJ0WGl5MU5CcS93RFdHdmFzd0c0THA1WjlRTSsvTGUyWGZsbVRlWWUrUGdGNnI4akxmL1c1SkNvelBHZlpTQkpNNkRTR2kwR2t6SzBBS1NvaGhRRDB4ZW1GQ3VhZFlMNHlzNk9hVm1CUW9FQ2dRUUlCSklFa2dTU0E3L0o0L3dETC9ZQU9rMWk5cVd4ZDlmcW9KQTVxaVN6RWd2YkZpejhrQWZiUi9oY1orUVZyVTYxbThudjZBMjd4UDJ6WVpRQjNqRDQvL2dQajNRYVEwYlZHdG53dFpuMjBDWWJYWU1pVDUvUjZHNEtXblBYU0NMRVZnQmpXcXpnTkVRcWhGc1ovK3IrRGpLczNuMkhwcnFNVFJ5eFNhNldNNUl1aTlQeFZKOG9qV0wwd1h4c09tRVRITk9sbXNXV0NBaEtKSkFra0NTUUhmbmxxTWdHdkprOFh2aS9QOS8yVUV2d0oyc3M1QUVIVkVra0dwWjdqZ0xjQTArTE90UlEwRm5RT0xjR29GdC8ycVVJRGJmMnkzZWZIRkpnREt2R3VqT2U0SFZvV2d6YVp4MnMwcHFyWXQwWkVhWVdtYnZzdHFEUXRHZ01hbEZnalFNZEp0R3JyS2pTTlJKSkFEMHorMmtvUFRQWml5eDFTbzRwMHZqOE1kQWdrb2trQ08vb0lEK1ovdjJydmREVzdrLzMrQUZ1d0d6RHdBa1BsZFgwelVFa2xHdU1VcVVRSVBZVlFraENrZ1RjYzl4cjFBZFFJSklKUWhDMFZKSUdxbFFpa0VBbW9JUVFLUkVrbEVsbzdCQ1U4bWd0TEVXZzJ6WnEwbm81MldCMll2ajd4ZFJoSktKSkFra0IzZUwrLzcvdGRBNzdYOS9IL0FJQ1J6QmUvNFFRTVdLRFRGaEJBanNDRWhVUWdhUUtDaEN0VkZvMWRzNVVWcFl1WXRBb2JGb05zMGkxQXlubHphQmYvQUY4RGFkeFZSY3FxSE5RTTVWWmtzclFNNXBrejVLTkNMRVNER1lZYUZFV1drRVFONXdGZkdWbjBmbDBTbzUrbjhpeXgwQ2JWY2kxZkhPWjB3MGhTUUdYMnZYK1A5K0JaaU12dGV2OEFBS0hOR1lVRDF3UGxadlB1QVdKTFZFa1JRWWlna1FxSVVvQkNPanFWVHJPUWdBUVZRNVY2Vko4WDl0Yjhvb3hZZGpOOHZoQlp5Yk5VK1NETWxMUUFJQXdhV2huVEIwUWhCSkFGWXovTG96eEZBcEx1blJvTkpua29IVnFSb21mVENVSFB5a2w0WmRXTEdwVUNTVU12dGY0TmpMVXV6UGYvQUQvd0JyVWtyTFV6ZUlnZlN2VENWR2NYcGFRTStuOHJDZ1dMRnEwMEdVY3oyYUlPZS9nYTZaTDdNK240Qm5WcXNzQ0sxbndtV3QrZjJxTkxTc1ppaTR6TWJZemxSdE04bGtPalJScWdxVU5pb2ptczZaUldweHdVT1NoWnZGL0ZhWnZqYjNRYTFaQkZkQTR6WlR5MERFb3ZsOEcrT2N4a0dwMFZKd1VvRWtpcXBIRlJteVZoMGpIbGVWaFFrbFJydm1mei92NVBqMnpMamN6MkFrSUNDS0ExREVpbERSZU9RSzJzN1NEV2xpTndLV2I0eS9ocEtqbFpZSFppK1B3Qk9oWnVNcVVxbEVEak5tSmdjWHBpaEFUeGpONnJiRm5QMnNRU1d0eVljNDRJSkpBa2tDRjJkRkF6djRVdHBRcFp6blNDaFRPMGJ5bURhd2ZTMENsMkxxaTkyUExzank5aUxXU0NyS2I4YjdNTmVQZCtnYlROdWZzYi9zQnZXZEcrOVFLTFVOUlN1L2RudHJvRm44cnRHQXpHcEI3dEEwZ1ZSSklHU3pwWlU3QzU5TnlxaEZLQmlOQklwWnZZOUxXSEJTbG5WdDlsR2xyR25RYlRPclRScERWcG9XTmthMXp6YlJHdGcwK21IMHdVYXkxWU1CUTRjd29KSWd5NTN0MmNhc0FRVlJHQXdEL3YvQnlVaW9hWkxUNllvd2xod0RJczFXcUlIcmdJZ0RwQU5Rc3hvaUpKS0JJVmxWV1YzVGdHVmF6MEtJMXUwc3l5SGJSV2hlaGJsUGFnV0N5bEZXTTJZMHFvenkxUEcvSWFsRUdVY3RoQUhCR2xFUVJBemVPVnRndTJBWlRybTNnclEzRmpOMlZCMDF5OHUyb0xGUmxBcUl3SHhtZ2ZwcVQ1UFNCQ2tBT3ByTzZyVUt2c1c2cWdXbURGT0FkQWtndkh1dHMrUHUwcUpKQUJScTFsVElWS2xHTE1XWEd4QVo5TmFrSVNnOG9vUllEU0JBVU5EQlVsaXR3RXRaMVphU0lwY2JZdmpXcGZaUWlsbnY2QTRzU1F4WVVnU3FSb3pvdkpWQmhLOXBwRTE0OTM2WmE4ZTc5QTJrZ0ZTN29vTTFJeEZadmFQdmZzK3dNbk4remk2VVVyVEhWYlFNUWpTb2trRENLRVVXcElzSVNSVXRTQWhJb1V6bzlSZzJtUFUxcVlFV1JhTFZnTWtQTE90UlVPTENFVkpBVXFCb0VocUVLWkpnUExqb1RyaHE5T2RsaXhFa2xFMTQ5MzZaTXVBNk0xbStWclU1QXhtOHRNMlgyUlF2eitqNmI4TEw4S2pNYkdYNFJoclROV0xEQm0xdUNZMW9JaTJNNkRvblBWb05CQVE2dHBrV0lvUldJb2FBMEY3cUJRRzhud3ZUTDdJa29NV0ZLak44WmZ3eGZHeDFGNkZjbTRzSlRFa08wVldwV0pSSkdSQlJFVVJFTktKaTQwNVh0VVNTQk5lTWx2TExmaDNmb0dzbndxVURMVE03YUJKSUVrc0JZc0JCbStPczJXZlRvZ1k0V041QmdNWW1rREdvTlNlNkRjTExRb1JjN29odDBJaUJYdEs5Uy93TEdwV25PWEcwNHBTUUpueXJUSGtDMGFBcHAyMXFjTXcwRzBJVUZrS1p0QWdnRENEZUdrWi95NTN1dWd2am9NSTJZQVRYaDNmcGxydzd2MERvaHFBVTZFZ3BVQ0tkSUtvZ1JxQlRPclJXa0Zxb2Y0QzBnNHR4bU5KVmhJUU5NMHMzc1FFSVJMMnNTOXdaYmd6bG9yUzBzbGthWThqcFdEQWFzWlVSQ29MY2JsMWlOWWxHaElTQ1pyV3NxS1ZYbG04TmdPdWx0U0VackpvVVRYajdzdGVJTkpEVVVoZGtBVWdaOVg0SHFvdmRTb2Vma2FjQU54cU1sRlY0R3JKZWFaSkFXRklHZlNzc2EwaU1UNHJTczFSUk0xcGtBQ0VSSklHdmlrZVB3VVZKSVZGWWxFeFhSanlBWXkxNmdDamJHTnhLTklKVVFudVJFQjVTRFdtZUZVYTNHUGxyeHZBaXM0WWJ0NFlVVFhqNy9UTFhqNy9RRzNJeHpXNU51M3BwRkVuQ0tBRklITzkxS3psS0hSZndrQkxNNE94QnJWclB0VkFhTE11MW9HT21wV05TbzZhbU5hMEVpQUZaYVpSRWtnVWJyRGZzTEdkYWxZc1U3QjFRbFFGaXpXaENxejZTMGtHVk8yc0hRRXM3UGxiQkZXWlZib1ZZYldlendDRlBVRXVKS2hDSUJxZS8wRGx3RlBMRHVzR1hBYnR4U3hpM1FEcnNHaWRKRlF3b0JpYVdLaklid1lES05sQUpxUU53SEpKQVVFRFd0YXdnYkZVSU1KcXhsRWFrSWpRckxQdTNXYURTVVNLTlVGVTdVYlNTSWhTelFaeXJLMUZlNHVxelFiMnlxSXBBa2tDS25OYjY2QlNZa2dac1dOZ0djV05JR1lTUUdJb0VrZ1NTQkpJRmtLUVAvWiIgLz4KPC9zdmc+	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Von-der-Kuh-zum-Kaese-Kaesereifuehrung_ev_23167121	general	f	t	\N	025, Web: tschwww.huettstaedterhof.at, 08.2025	2025-08-14 11:16:44.102833	2025-08-19 11:11:12.040321	all	1	12	f	\N	\N
76	schladming_ev_25521952	Einladung zum Vortrag „Ramsauerweg auf den Dachstein über die Hunerscharte“	\N	\N	2025-08-21 00:00:00	\N	https://www.schladming-dachstein.at/_default_upload_bucket/image-thumb__2639516__teaser-row-sm/Museum%20Zeitroas.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Einladung-zum-Vortrag-Ramsauerweg-auf-den-Dachstein-ueber-die-Hunerscharte_ev_25521952	general	f	t	\N	\N	2025-08-19 08:55:14.957858	2025-08-19 11:24:19.012842	all	1	12	f	\N	\N
55	schladming_ev_22924921	Maibaumumschneiden der Hahnlstoana Kleinsölk	Die Schuhplattlergruppe Hahnlstoana Kleinsölk lädt herzlich zum traditionellen Maibaumumschneiden ein!\n\nMit Festzelt, Live-Musik mit den "Hochgrössen Buam", Verlosung toller Preise und bester kulinarischer Verpflegung ist für Stimmung und Geselligkeit gesorgt.\n\nHier geht´s zum Flyer!\n	ehemalige Volksschule Kleinsölk	2025-08-20 08:54:31.642	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRXNBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNnUUFRQUNBQVVFQXdBREFRRUJBQUFBQUFBQkVTRXhRVkZoQWhKeDhJR1JvYkhSNFNMQjhmL0VBQlVCQVFFQUFBQUFBQUFBQUFBQUFBQUFBQUFCLzhRQUZSRUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFBSC8yZ0FNQXdFQUFoRURFUUEvQU1BQUNnSUtnQ29vQUlDaUZndGlLQ0FBQW9JQUMySUFvQUlvQUFaZ0FBQUFTc1JDQUxYMGk1SklBdmt3QkJxa29FQUFMM2tBQVFGbW95eFNsQU1QN1c4TVBsQUdWQUZRQVVRQlJGQkFBQUFBQUZwSVd3RVdVQVVvQXdBQUFBQUFzQUFBQUFBQUZFRUZLUVVBQUJGQXdEQUFBQVFBRndRQUJiQkJRQ2txVmhxZ1pSdWtyMkFaRnJuN0trRVZNWUFBQVZBQVZBRlFVQUVBQUJSQUZBQUJKQlREZjhaQWF3My9BQStVUUdrRkFBQUFBUlFFQUJVQUJVVUNVVkFBQUFBYWpaY3NOTkdHODRCUWo5QUVyaFFCUHFWQVpyajZ4U3VmdkJzQmlwOXhSMHBQditRWUc2NC84U3ZQOGd5TFh1U1ZPd0FpZ0FBQUFvQUFqY1ZFY2d6RVRPaTlzdFhPeGlEUGJLVk96VnlXREFzb0NpS0FBQ0NnSXVvQWhZQUdISUFLZ0NOTXFBYUJJSXNUVW9BM084TlF4RTFoT1M1WWcwZSs1bnZ1Ujc3bUI3N2tBQUh2dUo3N2tBSHZ1WUFLZ0FxQVY3bXpYRWZ3MEF4WGtwb29HYUFCRkFFYWpPSVE2YzRCMUFBWTZtMk92UUdBQUZFQUFBRkFSWURjQkFBQUFBQmFqTW9pNlN3QVdJd3NHUnF1VW9FYmlid25QUmdCMGpERFRSZmZjbWM0YWprRDMzTTkwL3c5MC93OTEvMEQzM005OXlQZFA4VUVEMzJ6MzNFQlQzM05QZmNnQlQzM0lFRlFBVkFTV1cwb0dSYVJBWHB6aEd1bk9GR3dBR092UnRqcjArUVlBQlJGQUJBVUFBS05BUUFBQUFBR295Wmh2UmtFbFl5KzBhMEJscGt1Z2FucDJacHVKWENmSU1yT1NLREVOVnpKRUxzQ1hPNmQwOGZTMHpRTmQzQjNjZnFSQzF4K2dkMGN0ZDBic1liU1ZISU4zRzhLNTFISlViL2dPZzUxeVk3L0FLRG9PZjhBMHQ5VzM0RGFNOTI4TDNRQzB5dmRDWEc0STEwNXBFWGszSFRXS0NpaWlNZGVueTJreFlPUTFQVFNRQ0MxNy9aUUNOVnlSQUlLbFNBQUNDb0FBQUFEZWpNcm9nQzZJMW9neWxTMEF6a3NaclJTaVVzQnNpckdxNlFibW55cUlsTkNLUWxMQ2c1aldvREl1NnFqTWl5VkFNcmp1dFVVQ1hKY2xGQVk3ZmpVZE41d2RNYnVnSUFBQUFBQWt4bldFcUE1WlRpMWhMWFZGK1hKQnIrOFMwdFFXTlZaVUNjbFNWQktoSmhTUVlBVUVVQnJRWFJFQmRFQUZSWUJkaTkyWm00a2pMNVVYTEQ2Rm5HUDFrRnZkZEVuTDNKSUJyWDdEKzFBQVJXWnpDY3dEY2haU3dKS1NWZ0Nnd1VTb3pqTTAxZ2RNWXpLam9pb0FrekVFNFJNdWNUOWczM2NIZHgrc1RLSXJwM2NOT1hEVjFJTmdLZzU5VVkrWFJucWk0OFNEQWs1cUNMYUFMeVdnQ3hLek5zZ0FBQlNLRFFJZ0tpZ2pkWVlNck9haVRoRkpHWHk2VkNVQ3hOc1pTMUdhZFdFZ1JqTE9YdXkvWlA5QTFDc3cwQ0dvSXFTZmhxU0NTZlJTVkFMOUxVOEpVSHlxTFU3d1Z5bjJmWUZjdDlPVStaWWpOMGpJQVZBU2NwY293ZHB4aVlZN09RWWxXK3c3UldNbGpPUFA4TDJ6dXNkTXhxRFFBZ1RsSUE1YW91NkFBQUFBQ2dJS0FnQU5ZR0NZR0FMY0ZwZ0F0K1Mwc0JiSm1VTkk4ZzNIVmVtS2RVNHAwNWs1Z1g0Si84QUlMajJDY1orZ0lhWmhRVk5WaE5RSkFCV0cyYmpVRXc1L1Z2aGU2RXZnQytDK0ZadWR3YXh3OHVqaGM3dFgxVm4vQU9vNWQzVnYrSGQxYi9nT2l1WGQxZXd2ZDFjZlFPZzU5M1Z4OUhkUEFOakhkUEIzVHRBTmpIZk8wSGZPMEEyTWQ4N0hmT3dNOVdjc3JNM05vQ2dBQUFvQ0FBQWlpaFJTd3RvRkZKWmRLRkl0M0tZMkJEVnhsTEt5RFVSVEU0eTFFWU1aZ3VIQk9jcDlBTndKRXRYQURMVnd6ZmtEWlV6NFg1QXRKQ2tFMFJ1Z0RTUEREb2xLTUxEVkFJQUFETWd0d1hESzBDcXl1TVpncUtmNENFcUFrUloyeTBBeFEzbXpRTXF0RkFpaUFBQUFBcTBpb0pNYkpVdGdNMkRRSmVDZ0NUT0ZNTlVkcWlDOXBVZ1lLVXNRQ1lmL1Z3S2xrR2tCQlFBUlFBc0tWUkJTUVpBQWk3dllxWm5GWTBYTFRHZ0lpSVNya21MamtyUkZLaUorTVBLVGZWOFFtTU5SSWpPV0M3ZUY2djFGQWdJQlJhS1FaRm9xUVFXcFRIWUVYdGpjcE1WRjdlVHQ1UUJhNUtTNUxBTEJBVW9BQUJTeWlnRnRBRkVBRlFCUkFBcUVVRndFVUFRQmJMUUJiU1JBQUZGaks2WGFUS01zUEtSRVovU0tlTTF3OFRLV2Z3Q1pYYTFxWVJpVE8zMklrMVdIemdMT1Zab29JcUFXV0FMWmFGQTFhV2dEVmxzQU4ybHd5QXNvQU5BSUFBQUFDb0FwWlJRQUFBQUFBQUFBQUFBQWhRQUFBQ2kzaGlJazVndGx5bWdDMmVOVU5BV3ByTVM5MS93RWFaVUZKZ1NRRVZFQVZBQUFSUVVRQUdnRUJVV3dBQUVVQUJBQUFVQUFFQlVBQlVVRUZRQUFDMHRXb2pVR1J1b0toUmhKZEtoaWVtYndnRTBrS1FGWFNXUUJZUllBYVpVRlNWVElFcVZVQmtXa1FBQUFBQUZGQVFBQUFBRlFBQUFBQVZBQUFBQUJVS0FLTUNRQUtCWWFTS1cxQUVCUXNBQUJLalk3WUZCbnNqbGFLNW1FcWR3V1dWLzYzUUZTUWtFQUFBQUJFRkFBQUFWRkFBQUFBQUFBQUVVQUFBUUJRQUFBQVBnRkFVRXBRRStURlVCTVZ1UUF1VnNwQVd5NFJLQnE0TGpkbWlnYW1lVVFCVWtBQUFFRnFkZ1JWN2ZCMjhnaU5VVURKYlZGQWdDQ29BQUxBSW9SbkhrRm1JaGxycXpaQlFBUlVBVkFCUkFGRVdRUlVBV3hBRkNDVkVWRkFBQlVBQVdsZ0dWcG9CaXBLbG9CbXVVeWJabk1FQUFiYzlYUUFaTEJRUUZCQWYvMlE9PSIgLz4KPC9zdmc+	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Maibaumumschneiden-der-Hahnlstoana-Kleinsoelk_ev_22924921	general	f	t	\N	025, 08.2025	2025-08-18 03:00:21.855558	2025-08-19 08:55:14.968623	all	1	12	f	\N	\N
65	schladming_ev_447892	Bergmesse auf der Hornfeldspitze	\nBergmesse im Gedenken an die Bergrettungskameraden.\nBeginn: 11 Uhr - Abmarsch bei der Sölkpasskapelle: 09:45 Uhr.\n\nBei Schlechtwetter findet die Bergmesse bei der Bergrettungshütte statt.\n\nAuf Euer Kommen freut sich die Bergrettung St. Nikolai.\n	Naturpark Sölktäler - Sölkpass	2025-08-20 08:54:51.083	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NSIgdmlld0JveD0iMCAwIDQwMCAyNjUiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUpBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNZUUFRRUJBQUlDQWdFRUFnTUFBQUFBQUFBQkVTRXhRVkVDWVlFU2NaR2hNa0lpd2VIL3hBQVdBUUVCQVFBQUFBQUFBQUFBQUFBQUFBQUFBUUwveEFBWEVRRUJBUUVBQUFBQUFBQUFBQUFBQUFBQUVRRWgvOW9BREFNQkFBSVJBeEVBUHdESUNvQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFvSUtnQUFBQUFBQUFBQUFBQUFBQUFLQ0FBQUFBQUFBQUFBQUFBQUFBQW9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDS0FBQUlvQ0NnSUtBZ29DQUFBQW9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSUNoK3dBQUFBQUFBQUFLZ0FBQUFBQUFBQUFBQUxpWmpVcFVWa0JVQUFBQUFBQUFBQUFBQUFBQUFBRkdnWXN1TXVqRm1JcWhCVUFBQUtBRUJWRUJGUlQ4QWdBQUFBQUFBQUFDeWFpejVjWWxXTlpJeW10U2FMT01qVmpLc2dBQUFBQUFBQUFBQUFBQUFBQUtyT3JLbXFwWm9BZ3Q2UmNRRTBCU3o4a1ZGWlZyaEwwQ0l2T0lvQkw3Vys1NkFSbmxyZUVwQU9EdVFJa2FaenBWUVNMTkx3aXdFaWxJZHBsVlFNdmxyVTNnQmIweFcvRll6UVJVdkhCemdLSkY0OHFHaWVVcURhRTZGeEFFZ0tCS0FBQUFBQUNFcThKWmlLMk15NHN1Z1V3N2ErZ2MxdkVYSk5UQUoydjcveXoxeTNBVktkZnNiNUJKeEdieWQxZkVnSjlOWGlZU05CWE8rQ3pLdnk3aTJhQ2Nma25DTGJ3QnZBbmc3QlpVdk5NWDFSWXZWaDJ6dTFyNHp6L0FMUGo3NFhJQWk1UFVNbnBONVVHTHhxYmkrYkdiNWdKM1RucHFUalNXQXl2cGJNbjJ5RFYrbVd1R0FhTkxtUWtnQzhlbXVFdkVCbW1sNmlBMXBTOUY1QU5SZkhRQ3A0T01CWkpWL1Q2cVJvSE96RWJxU1VDZDZ1NVdlZ0Z0Mmx2WWdJMXZDWmk5QzRtM3lTcFFGYlppVytCSFFaT1FTOS9rdmVvdWNYK1FaV0w5KzRaQlltTlQ3WHFhbmYvZ0o1Vy8wbTg1L1pmQUdiVy9xSkovYWlDS2dKRzJZMERuZTdmdE5BR3QvNC9iRVVBdFRTa0JVc3hUL1g4Z2dFQWk1eG92akFTRm1aaUx1Z2ExNDFPeThjQWxpejdNNFFWckxKZkxMZjJuVy8wSXp6RjJnQnZ0cU1yS0JVVzFFQUFDbDlCQldSZlpMaW8xT0djNWFaM25VVlo1UlJVTjl0K1B3NWExTDlBQlo1aDF6UnF0ZkwvSCtIT2R0VzZneVVoclU4QTJLZ0lMaUFRK1hTeG41ZUFZVTd3UUVVQXM0NEpQYS9McFBqMnFwWjZYeGw5bW1iNUVSUVFRVUJtbzFVVUYyMUVCMCtOOE0yWlVsYUJKdmd1NXBBVnJ3eXRFUVhFV2dnSmdHbXBnbzE0V2RKNHc4WWlvaTR1Y1lJZURORjJpb0JSR1JWeFJtWEZxcGdJMGlvSlZuL0FHenF4UjJSbWZKc0VSYWdETjVyYm1BQWdJb0NVbkNnTXJ5S0NOU2NJQXVNcnBnTTBCUnUvd0NMbTZmNnNDdFRCbU4zclVSa0FFdDBpNEtGSlNLZ0FBQW9JQUFBQXFBQUFBaWdBQUFBbUdLZ0N5MkFEWDZrbnkra0ZHLzFTeHpVUUFRRkVVQUFBRUJRQUFBU3BqV2dFdkZqTFdHS0lzdWNWQkFCUUFBQUFEVUFVUlFCQUZBQUFBQUFBQUFBQkFBMEFBQVVBVVJRRXhVQUFBRUFVQUJGUHlBWVorNXFoZ2F1d0E3VTBFL1NqVzAyb01qWDZ2cE5sNlVRQkFBQUFBQUFFVUFFQUFBQUFBQUJRRVVCTVVBQUFBVlJBWkJyVTFBR2hGUU1OU29vMklUcWdXNmRubW9BdjRLUUUwVkFRMHFBMXE2d29OeXMzdFlsN0IvLzJRPT0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Bergmesse-auf-der-Hornfeldspitze_ev_447892	market	f	t	\N	+43 676 94, 025, +43 676 94 22 135, 08.2025	2025-08-18 13:13:43.316049	2025-08-19 08:55:14.975788	all	1	12	f	\N	\N
70	schladming_ev_453249	Bergwelten Klettersteigcamp in Ramsau am Dachstein	ABGESAGT!\n\nErlebe dein erstes Klettersteig-Abenteuer mit Bergwelten!\n\nBist du bereit, die Faszination des Klettersteigens zu entdecken? Egal ob Anfänger, Fortgeschrittener oder einfach bergbegeistert – die Veranstaltung "Mein erster Klettersteig 2025" bietet dir die perfekte Gelegenheit, in die Welt der Klettersteige einzutauchen.\n\nGekonnt und sicher durch Felswände steigen, wo sonst nur Kletterer unterwegs sind: Möchtest&nbsp;du&nbsp;die Faszination Klettersteig erleben, aber hattest&nbsp;noch&nbsp;nie die Gelegenheit dazu? Du willst das neueste Material unserer Premium Partner testen? Oder willst du&nbsp;dein&nbsp;Können verbessern? Und zwar genau dort, wo 1843 der erste Klettersteig der Alpen errichtet wurde und sich heute ein Klettersteig-Eldorado mit 19 verschiedenen Steigen in unterschiedlichen Schwierigkeitsgraden befindet? Dann bist du&nbsp;beim Bergwelten Klettersteigcamp in Ramsau am Dachsteingenau richtig!&nbsp;Das sichere Begehen von Klettersteigen wird hier an drei Tagen mit unseren Bergführern&nbsp;in Theorie und Praxis vermittelt.\n\nAlle weiteren Informationen sowie das genaue Programm unter:&nbsp;Mein erster Klettersteig 2025 - Bergwelten\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Schladming","postalCode":"8970","streetAddress":"Ramsauerstraße 756","email":"info@schladming-dachstein.at"}	2025-08-20 08:55:02.076	\N	https://www.schladming-dachstein.at/Events/Ramsau-am-Dachstein/Sommer/Klettercamp/image-thumb__730558__masonry/Klettersteigcamp.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Bergwelten-Klettersteigcamp-in-Ramsau-am-Dachstein_ev_453249	nature	f	t	\N	025, 310info@schladming-dachstein.atwww.bergwelten.com, +43 3687 23 310, 08.2025	2025-08-18 13:13:43.323895	2025-08-19 08:55:14.980095	all	1	12	f	\N	\N
77	schladming_ev_24387769	Balance finden - auf der Matte und im Leben	In der Yogaeinheit „Balance finden - auf der Matte und im Leben“ werden fließende Vinyasas mit Atemtechniken und statischen Asanas kombiniert.\nBesonderes Augenmerk wird auf Gleichgewichtsübungen gelegt, die die kleinen Muskeln und Sehnen an unseren Gelenken, Fußsohlen und Handflächen stärken.\nUngleichgewichte werden sowohl körperlich, als auch mental reduziert. Affirmationen, die dich erden und bei dir bleiben lassen, leiten in die einzelnen Asanas. Eine Abschlussmeditation gibt dir Inspiration und Anhaltspunkte, wie du dich abgrenzen und immer wieder zu dir zurückkommen kannst.\n	Hotel Rösslhof****	2025-08-20 08:55:12.819	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDQwMCAyNjciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUxBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUI4UUFRRUJBUUFEQVFFQUF3QUFBQUFBQUFBQkVURVNJVUVDVVdHUndmL0VBQlVCQVFFQUFBQUFBQUFBQUFBQUFBQUFBQUFCLzhRQUZCRUJBQUFBQUFBQUFBQUFBQUFBQUFBQUFQL2FBQXdEQVFBQ0VRTVJBRDhBdzFHV29EWUNDb0FLZ0FLZ0Nvck51QWZvaVc2U2cySnFnQWdBb0NLZ0NpQUtJb0NLZ0FBQ1ZieHowR3RYMDVxRHBpWXM0b014Y1VCbkZ4UUdjTWFBWnd4b0JNUmROZ0ppNGJEWUFXR3hOZ09iVVpXVlIwRTAxQlJuVHlCb1o4anlCb1o4azhnYlovU2VTVzZDS0NqVTlIa3dBMXE2d0EzNU5hNUtEcHByQ2UwSFRUWTVhS091cHJtQTZhYkhNQjA4b2VVWWtYYzRnMTFuRTJvb3VCTFd1Z200ZVNXVkFhOGp5cks0QjVVMm1HQWJUYVlZQnROcGhnSm9vQ0NnSUtBZ29pb0tBZ29DQ2dKaGlnSmlnQWhSVUFBQUFGd2pTQ1lrL2pTV2ZRUVZCUUZ3RVV3QkxVQlVCVUJZMnhHa1ZLalZUQVFVQkJRRUZBUVVCQlFFRkFRVUF3eFFFd3hRRXd4UUV3eFFFd3hRRXdWS0RJQ29BZ0tBQ3hwbUxxSzBsNGFhQUFJQUNpVldSRUJWRUFCcUxpUlVVNkdBQUFBQUFBQ0FBQUFBQUFDZ0FBQUFBQUFBQU0xcGlpQUNnaW9Bb0Fxd1hJaW90dnBLZjRCUWdJQUFWaHFzaWl4RkJGQUZWQUZBQUFBQUFBQkFBQUFBQUFBVUFBQUFBQUFBQVJLeTFXVkFBQkZRRkFCcFl5cUtWRkw2QlFCQUFFcksxQlZnQUNpZ0lvQUFBQUFBQWdBQUFBQUFBQUFvQUFBQUFBQWdBRE5RUlFWRkFSUUFBR2lvcUtoZXRNZzBBSUFBelRCUlRERlZVUVVRRVZRWkdtUUFCUUVBQUFBQUFBQUFBQlFBQUJBQUFBQktyTkJFQlFVSUFBQ29zUHRBVFZRRkFxRFFBQUFJQ0NxMHlzVkdnQVFWRUZBVVl2VmlYcUlyU0w4UUFBQUFBQUFBQUFGQUVBQUFBQUFHSzJ5Q0NxS3lOWWdpQUtMT3JlLzZUNnQvNENYcU5BTXhUZ0RRcUlCUktBZ0Npb29OS3hHbFJVcWdKQzhUaTNnTUFxS3Z3V0wwUmdheGtBQVVBQUFBQUJRQkFBQUFBQUVxRlFWVlJRVkxHZ0dFYVFRWCtWbHFLS2xXQUNLbEJvWjFwRlFxcFJHUUJWUVVCWldWQnJWWm5WVkVzWDRvREJqZUlpa1ZOVVJXYkZMeFJnQkZBQUFBQUFVQVFBQUFBQUJnQVZWUlFhQUFaeHBCR1JhaWpRa1VCS3JON1FJczZpeEZhU2xvRElxQUFLZ0tpQ3hxTU5TcU5DYWFDczJpQUxxQ0sxcVdvS2dBaWdBQUFBQUtKcG9LSnBvS0pwb0tKcG9NaW9DcWlnMEFDQ0tCVWlvcUNWcXMwRmxSRlJUNFFBWHRhWmpRTTFHbVFCUlVGQUZBQktKcHFDaWFhS3FHbWdCcG9BYWFBR21nQm9BQ0FBQUFBQUFBQUlxQXFvb05DS0RLb3FvSW9CVXZGU2d5QWlxQURVQk5CVXY5RkJscnJObUpxbzNpc3o5TmFBbjZYMHpmZEJBRVVBQUExVUJOQVVRQUFBRkVWQUFVYVFFRkFRVlFaR2dHVVg2Z0txQU5LaWdsUmFpb29BQU03b0lvdUlxS3FXZ3BrSlZBUlVCTHhscThaVkFBQlVBWFRVQVZBQUVVQUFBQUJZaXdBVVJVRlFHaFFSQlFFRkFRVUJsR3F6UlVWRkJXbVZCV0dtUVZOTVVFVVVERkU0QVdDcU1OYWxRUm9RMUZMeGxiV1ZSUkFGRUFVUlFFYVFBQUFBQU1ia0JKRlVRUVVGUkdnQVVFUUFBQUFCUVM4Vkx3R0JVUlZWRkFvb0FLQUFnS2dLaWdDcGVPYnBXQkVBQUFBQUFGd0FNVkFVUUF3RzRETWpXUlUwRkFGRlFFVVFCVUFBQkFBQUFVRTFRRTB2RlM4QmxGUkZGUlFWVVVBQUFCVUZRbjBGQUFZc2Fab01nc0JGeFVBVkFBUUJSQUZFVUJVQWExQ0tLQUFLaWdLaWdBZ1AvWiIgLz4KPC9zdmc+	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Balance-finden-auf-der-Matte-und-im-Leben_ev_24387769	general	f	t	\N	+43 3687 81444, 025, 81444hotel@roesslhof.athttp, 0.08.2025	2025-08-19 08:55:14.984793	2025-08-19 08:55:14.984793	all	1	12	f	\N	\N
61	schladming_ev_24465321	Einfach Eintauchen - 50 Minuten zum Auftanken	\N	\N	2025-08-27 00:00:00	\N	https://www.schladming-dachstein.at/_default_upload_bucket/image-thumb__2540810__teaser-row-sm/Sommerkirche.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Einfach-Eintauchen-50-Minuten-zum-Auftanken_ev_24465321	general	f	t	\N	\N	2025-08-18 13:02:33.035073	2025-08-19 11:24:19.003788	all	1	12	f	\N	\N
48	schladming_ev_22781212	The Music of Hans Zimmer & Others	\N	\N	2025-08-21 00:00:00	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/04%20-%20April/The%20music%20of%20Hans%20Zimmer-Harry%20Potter/image-thumb__2339398__teaser-row-sm/The%20Music%20of%20Hans%20Zimmer_2025_%C2%A9Sergey%20Shcherbak%20%286%29.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/The-Music-of-Hans-Zimmer-Others_ev_22781212	general	f	t	\N	\N	2025-08-14 11:16:44.119154	2025-08-19 11:24:19.016277	all	1	12	f	\N	\N
52	schladming_ev_24742790	Kinderzaubershow in Gröbming	Ein Nachmittag voller Magie für die ganze Familie!\n\nDer Alpenzauberer verzaubert Kinder &amp; Jugendliche\n\nDanach: Modellierballon-Figuren für die Kleinen\n\nEintritt frei!\n\n\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Gröbming","postalCode":"8962","streetAddress":null,"email":"rene.binder@groebming.at"}	2025-08-20 08:54:24.157	\N	https://www.schladming-dachstein.at/Events/Groebminger-Land/Events/Diverse/image-thumb__2560231__masonry/Alpenzauberer.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Kinderzaubershow-in-Groebming_ev_24742790	family	f	t	\N	+43 3685 22150, 025, 22150rene.binder@groebming.atwww.groebming.at, 08.2025	2025-08-17 03:00:21.283667	2025-08-19 08:55:14.96404	all	1	12	f	\N	\N
53	schladming_ev_19188463	"Kulinarik" im Schlosscafé	Das Museum "Schloss Großsölk" mit seinem Jesuitengarten ist ein Geheimtipp für Natur- und Erholungssuchende.\n\nAn wenigen Tagen wird auch frisch gekocht!\n\nAn den Samstagen kredenzen wir&nbsp;Roggerne Kropf´n mit Bohnenkraut und Erdäpfel oder Steirerkas.\n\nAn den Sonntagen servieren wir frisches Ofenbratl mit Erdäpfel und Sauerkraut.\n\nWir freuen uns auf Deinen Besuch!\n	Schlosscafé Schloss Großsölk	2025-08-20 08:54:27.981	\N	https://www.schladming-dachstein.at/Events/Naturpark-Soelktaeler/Veranstaltungen-Sommer/Sommerevents/image-thumb__715557__masonry/Anita%20Himmer%20%28c%29%20Anita%20Himmer.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Kulinarik-im-Schlosscafe_ev_19188463	culinary	f	t	\N	078961, +43 677 64, lknaturpark@soelktaeler.comwww.soelktaeler.com, +43 677 64 41 24	2025-08-17 03:00:21.285486	2025-08-19 08:55:14.966398	all	1	12	f	\N	\N
54	schladming_ev_21710429	Sommerfest mit originalem Ennstaler Bierkisten-Schießen	Programm:\n14:30 Uhr - aufwärmen und einschießen\n15:00&nbsp;Uhr - Turnierstart des 4.&nbsp;Ennstaler&nbsp;Bierkistens-Schießens\n\nEine Mannschaft besteht aus 4 Personen\nNenngeld: € 60,00 pro Mannschaft (inkl. 1 Essen + 1 Getränk)\n\nAnmeldung bis 18. August 2025 unter ff.altirdning@bfvli.at\n\nAb 19:00&nbsp;Uhr: Platzkonzert der Musikkapelle Irdning, anschließend sorgt das Grenzlandecho für Festzeltstimmung.\n\nVeranstalter: Freiwillige Feuerwehr Altirdning\n\n&nbsp;\n\n\n&nbsp;\n	Rüsthaus FF Altirdning	2025-08-20 08:54:29.5	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBR1FBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBSUJBLy9FQUNjUUFRRUFBZ0VEQkFJQ0F3RUFBQUFBQUFBQkFoRXhFbEZoSVVHQm9USnhzY0ZDa2VIdy84UUFGZ0VCQVFFQUFBQUFBQUFBQUFBQUFBQUFBQUVDLzhRQUdCRUJBUUVCQVFBQUFBQUFBQUFBQUFBQUFBRVJNVUgvMmdBTUF3RUFBaEVERVFBL0FJQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJ1Z1lBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRFpOZ1NiYmVGSnlUdFZJQ29BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUxrMG1jclNyQkY1V25MbEl0U0EweUNyUGVKQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQldQdXBPUHVwbTlhZ21xQWN4dG1tTk1ybkRMREgzVXp5dGVPWXF4TFRJQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRFpOZ3diZVdBcWNxUk9WczFZQUlvblNoUmttbWdERU9pYXNTcEFWQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJjOUV6bGFWWW5KSytVNnBLVW5NV21SU1ZZeThNbGJlRXJPSlZqR3NxQUFKdkNtWGhZSUFhWkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFiT1ZvbkswcXdBWlVBQmw0UXFwYWlWVVVtS1M5V0FDQXk4TlRWaFVnTk1nQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQzU2eERaZEpWaXdHVkdOUmJ0WkFZTmFaYkZBeTBBSURtMjNiR3BFb0FxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBTmwwM3FTR0RiZHNBQlU3cFZMQ2tVSjJ6ZFp4clZiMG0zYkJjVFFCVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBR3lXOE1WamxyZm9CMDVkbWRON0w2L0gyenI4ZllJazN3S3c1K0ZaWTc5WnovSU9iYkxPWXgxejRCejFkYjltT21IRi9hY3NkZXM0L2dHU2I0TExPVzRjL0RjK1orZ1FycHZaZU05TjkyZGZnSE5YVGV4bGQ4TjYvSDJET205anB2WjAzNmI4YlJjL1RqN0JNbHZFYjAzc1RMWHNycjhmWUo2YjJaSmJ3cTU3bG1tNGU0STRKTGVHNWMxdUhOL1FKMVo2TjZiMmJsK1UrRjI2bXdjK205bVdXY3I2L0gybTNkMkIwM3NkTjdLNi9IMmRmajdCRmxuSnE4NmJsZDZYUHgrQWNnQUxMT1IyczI1V2E5QU5XK3pIWEg4Wjh1UUFBQUFBQUFBQUFBQUNzWkx2YVd5VzhBNmF4N1JPVWsxcG5UbDJPbTlnTU9maGR1cnJ1akRuNGJuelAwRGNzZmVOejRUamw3WDRWbndETU9QbHN1OXovMVpoeDhvdk4vWUxtT3I0Wm56UDBySExmN1RuelAwQmpscjBxdFMvd0RFOU4xNTdNa3lsQXMwbDB6NCtYTUhYL0g0L3B5ZGY4ZmorbklGNHlXZXZkV3NmRG5KYnczcHZZREtTYTByRDNUMDNzM0M4d0daYzF1SE4vUmxqZDdqY1paNjBHWmZsUGorVjNWNVJidkwvU3MrUGtEV1BhT2Z2OHNBZGRZOW9heDhJNmIyT205Z1M2ejhmaituT3l6bDBuNC9BT1FycHk3TTFxK29PdHVwdGxreW44R1g0LzZjNWRmb0hUR2FtbkoyNWNRQUFBQUFBQUFBQUFBRlk1YTM2SkFYMStQczYvSDJnQnN1cnN0MndBYjFlbW1BS21XcHdtK3Rhd0J0dXhnS21WbmxYWDRRd0cyN1lBTDZ2VFd2YlNCdWdiTXRleXV2eDl1WUM3bnVXYSswQUM1bjNoYzc3ZWlHZ3hWeTNOYVMzUU1BQmZYNCsyOWZqN2MyZzIzYlpucWExOW9BWDErUHROdTd0Z0NybHVhMGtBYk10TUFBQUFBQUFBQUFBQUFBQUFBQW9BZHdBYXdBYXdBYXdBR3NBR3NBYldBRFl3QUcrekFCdTJBRFdBRGZaZ0ExZ0Ezc3dBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQi85az0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Sommerfest-mit-originalem-Ennstaler-Bierkisten-Schiessen_ev_21710429	culinary	f	t	\N	025, 005, ff.altirdning@bfvli.at, irdning-donnersbachtalkdo.005@bfvli.steiermark.at	2025-08-17 03:00:21.286836	2025-08-19 08:55:14.967421	all	1	12	f	\N	\N
64	schladming_ev_25243168	Dämmerschoppen Dorfplatz Altirdning der Marktmusikkapelle Irdning	Ein musikalischer Abend in gemütlicher Atmosphäre erwartet dich beim Dämmerschoppen am Samstag, 24. August 2024, ab 19:00 Uhr am Dorfplatz Altirdning. Die Marktmusikkapelle Irdning lädt zu einem stimmungsvollen Ausklang des Tages mit traditionellen Klängen und geselligem Beisammensein. Genieße den Spätsommer bei Musik und guter Stimmung im Herzen von Altirdning.\n	Dorfplatz Altirdning	2025-08-20 08:54:48.875	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDQwMCAyNjciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUxBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNVUUFRRUFBZ0lCQXdRREFRQUFBQUFBQUFBQkVVRWhNUUlTVVhGaGdiSEJNa0tSOFAvRUFCVUJBUUVBQUFBQUFBQUFBQUFBQUFBQUFBQUIvOFFBRnhFQkFBTUFBQUFBQUFBQUFBQUFBQUFBQUFGQlVmL2FBQXdEQVFBQ0VRTVJBRDhBd0FBQUFBQUFBR0d2VFFaSFNlTU9KN0F4NmFXWWRQVkt6NTlTZ3dBS0ZBQ0FCUm9BTUtUWlNCWnBxZDFscWRnbDM4cmRmS2UveXQwQ3pxc3pYeXM2cVR1QXQ3aXorUDhBck43cS93QlFTZHhmTFVTZHd2WU5lUFgzWnZPVi9xay9ZTk01NSs2K1ZTZGcyU1pqTnVsOVh6d0l1S2ZabjFWcjFlOEZCY3lwWmlaRVpvQW9DQUFBZ0FnQUFBQUFDejhPbVhPTHBGVzNLVlluY0JrVVVRUlFEUUFGQVFSUUFBRVhQSUFHZXZnQU5YN0U3Z0FlNWVwOEFDejlJQUxxRTBnQmVhczdxRUEyQUtxL1JJdUVEcjRXM013Z0FJS0tnQUFDSUFBQUFBQUFCR3ZmL3UyV2hTTDlFVkJrVzlvb2dBZ0FBQUFBQUFBQUFBQUdnQUFBQUFBQUFBQVZxRXBwVUUyaW9Db2lnQ0txQUFJQUFBQUFBQUM0WDlWVTdGRnprMFJCS2pXcXlvaEZTQ1NHZ2dCUUFDQUZDZ0FBYUFBYURRQUFBQUFCUUFBQVdDcUd6dEEwaW9BaW9BcUtxQUFJQUFFVUV3dUFGQ2lnZ1JjL1FGbTRrV2QvTS9CdEJXRzJiMm9pS2xBcERRSUJUUUVBQU5Cb0FBQUFBQUFBQUFBQUFBQnFNdFRvVlltekFnbnYvZ0dRRVZBRlJWUUFCQUFGckxlZ1JaTWttVG9Gc3dndVpnR2RoVnlCK3IrVnFkNVhVUlRndXFTR3FveWxVQkFnSUFRQW9BQUFBQUFBQUFBQUFBQUFVQUJwRjJLR2lsMGdnWkZCWjQ1Mms3YXRRWVZJcW9JQUNBQTFPa1dBc3VET1UyMWlZQmVNTXpsRmx3QlVXM0tRRldkV001cXo5ZmdWUTJaQmtXOW9DQUNBUUFBQUFBQUFBQUFBQUFBQUFBQUZXTllTQ0FlNGdJb2lpeGZLTEdMY2lFVkFBQUFBQllnQzB6VnErT0JVbExjMHZaaXdROVAxWmF6V1FWVUJXakhDSGFCVVhTS0pRQkFBQUFBQUFBQUFBQUFBQUFBQUFBVm95SWd1a1ZBUVZGR3BFc2F0NFp2U0FnS2dBQUFBQUM2Q0U3Rk9tc2x2Q1NaRUpFc3d0NFpCUkZGVWxJYlFQZEZTZ0lxS0FBZ0FBQUFBQUFBQUFBQUFBQUFzUlJRSlNJQ0tnQ3laUnJ4cWdsTm9nQUtnQUFBQUFCTzF2YUxRSkxWbHNKZUR1Z2ZLM0dDeVlaNW9JcUFLdFJiMGltQ21UUU1nS0FBZ0FBQUFBQUFBQUFBQUFBQUFxS2lsRVVFQVVHcFBkbHJQQURLb0FBSUFBQUFBQUxwRmdFbVZzd2t1QzNJQ3lyT21lN3dCZWFGbUVCVjB5c1JWaHRGd0RJdFJRQUVBQUFBQUFBQUFBQUFBQUFCUlFRT3dBUUJSWk1yZU9FbEwySWxBQUFBQUJBQUFBRmlBTlh0cVNZWnBtZ0hSS3RvRnVXV3BPR2FDaUtLYkxjaXpHRUVxTHBGQUFBQVFBQUFBQUFBQUVVQUFBQVZVRnlnSXFBQUtOU2JSYzhNNkFGUVFBQUFCQUFBQUFBYTB2aWtRR3ZJeFU1WDFBbWJFV2MxYklES29DcUIwZ0lwUVFCUUFFQUFBUUZFVUVWRkFSVUJSRkFBRlZLdUVRVkFVQ2NoQWF2RExWVFlGUmFnZ0FBQUNBQUFBQUFzRWFvTlptR1pNa21UbUF0bUVMY3RUb0dGU2dLVkZSVjBnQWdDaUtJSUFBcUNnZ0FDb0FBQUtpZ0FDbVJhaUFBb05TTW1SRnlnQVpFVUFBQUFFQUFCUVFBQnJUTFVBbHdXNVFCdkVZWE5RQUFGRVVWTXFtMXRRUUJRUlFSQlFVQUFBQVJRRUZBQUFGUUFBQUFBUUJGUVVBQUFBQUFFQUFBQlVBQllBQUlDaUFLSUFvaWl3VmNJSUtpb29BQUFBQUFBQUFBQUFBQUtKVUFCUUFFUUFCVVVBQUFBQUFCRkFRVUJCUUVGQVFVQkJRRUFBV0lBMFRnWFFxZDB3VUVFRUFBQUFBQUFBQVdJQTBtRVVCVWEwRElJS29paUlLQWlvb0FBQUFBQVAvOWs9IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Daemmerschoppen-Dorfplatz-Altirdning-der-Marktmusikkapelle-Irdning_ev_25243168	music	f	t	\N	024, +43 664 45, 403obmann@musikkapelle-irdning.atwww.musikkapelle-irdning.at, +43 664 45 57 403	2025-08-18 13:13:43.314919	2025-08-19 08:55:14.974647	all	1	12	f	\N	\N
50	schladming_ev_25257808	TCM Tage - Element Erde mit Petra Pfann	Ernährung im Spätsommer&nbsp;\nFreitag, 22. August\nGanztägig: Individuelle TCM-Ernährungsberatung &amp; spezielle TCM-Speisekarte im brunners Gasthaus.\n19:00 - 21:00 Uhr: Vortrag "Das Erde-Element aus Sicht der TCM - passende Ernährung im Spätsommer".\n\nSamstag, 23. August&nbsp;\n07:30 - 10:00 Uhr: TCM-Frühstück mit Gerichten passend&nbsp;zum Element\n08:00 - 09:00 Uhr: Yoga mit Andrea&nbsp;\nGanztägig: Individuelle TCM-Ernährungsberatung &amp; spezielle TCM-Speisekarte im brunners Gasthaus.\n19:00 - 21:00 Uhr: Vortrag "Gesunde Kinder-Ernährung für Klein- und Schulkind aus Sicht der TCM".\n\nSonntag, 24. August&nbsp;\n07:30 - 10:00 Uhr: TCM-Frühstück mit Gerichten passend zum Element&nbsp;\n08:00 - 09:00 Uhr: Meridian- und Energieübungen. Besonderes Augenmerk richten wir dabei auf das Erde-Element. Die Übungen wirken sehr ausgleichend, Verdauungsanregend und Mitte stärkend.&nbsp;\n\n\n&nbsp;\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Schladming","postalCode":"8970","streetAddress":"Hauptplatz 14 ","email":"welcome@stadthotel-brunner.at"}	2025-08-20 08:54:19.814	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/08%20-%20August/Picnic%20%26%20Beats/image-thumb__2610168__masonry/TCM%20Tage%20Flyer%20August%202025%20Cover.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/TCM-Tage-Element-Erde-mit-Petra-Pfann_ev_25257808	general	f	t	\N	+43 3687 22513, 025, 22513welcome@stadthotel-brunner.at, 08.2025	2025-08-16 03:00:21.977568	2025-08-19 08:55:14.962091	all	1	12	f	\N	\N
57	schladming_ev_24000253	Curt Strohm live	Gefühl. Klang. Atmosphäre. Live.Musik ist Emotion – und Curt Strohm bringt sie direkt zu Ihnen. Ob gefühlvoll, soulig, dezent im Hintergrund oder mitreißend im Rampenlicht: Seine Solo-Performance am Keyboard und Gesang macht jeden Abend zu einem besonderen Erlebnis.Curt Strohm ist nicht nur Live-Musiker, sondern auch erfahrener Studioprofi. Er war unter anderem mit den Nockis, Carl Peyer, Robby Musenbichler und Betty O auf Tournee, wirkte bei Musicalproduktionen mit und stand bei Songcontests im Rampenlicht. Aktuell ist er mit dem „Billy Joel Songbook“ unterwegs und betreibt in Graz sein eigenes Tonstudio „Musicgarden“.Lassen Sie sich von seiner Musik berühren und genießen Sie einen Abend voller Klangmomente.	{"@type":"postalAddress","addressCountry":"AT","addressLocality":null,"postalCode":null,"streetAddress":null,"email":null}	2025-08-20 08:54:34.05	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRGhBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUN3UUFRQUNBUUlHQWdJQ0FRVUJBQUFBQUFBQkVTRlJZUkl4UVhHQm9aSHdBckVpUXVFeVVvTEIwZkgveEFBVkFRRUJBQUFBQUFBQUFBQUFBQUFBQUFBQUFmL0VBQmtSQVFFQkFRRUJBQUFBQUFBQUFBQUFBQUNCRVFGUndmL2FBQXdEQVFBQ0VRTVJBRDhBeUlvQUFDb3FLQWVRVldhWHlDaUw1QVE4bm4wQ0tVVnVBcWZKNUJvVE92cURPdnFBVVRPdjZNNitvQlJtOWM4L1UwMWNSMG4vQU9jd0tLT0xhZnNXY1ViOVBhb0MzRTF1emVsL0NLb21kZlJuWDBDaVoxOUdkZlFDcG5YMFoxOUFvbWRmUm5YMENpWjE5R2RmVUFCblgxQm5YOUFDWjEvUm5YOUFCNS9SblVBUEtlUUE4Z0NBSUFLdUFLaGdBR0JPd1dCRVNxRmcwTTJXQzBmWlMwamNHeEwyTERCVXY3Z3NNYUdiTERHaU1NMldHR3ZtZmo4b0o2Lzh2Y1FSTmRJT0tOSVV4ZXMvZjZwdHArV1BpWk9LUDlzRnhvR0VmMTdSN1dPVVZ6NmZNcGNhZllMak9PWVoxcTdqOWpOcmFHS0paWVlvbGxoaWlXV0dLTTJ0aGlvV2xoaWlXV0dLSlpZS2haWVlCYUJnQUdOekVhSlVhZmNzS3BXcWpUMlZHbnZ2L3dDTWdWcW8wOXJ3d3dCVzZqN3NuREdqQzBGYTRZblplR0dLS0N0VkMxR2pGRmJoV3VHSm5uM1hoaGlpdDQrUXJmREJ3d3pSWFpDdGNNSERETkpRVnZoZzRZWXBhN0JXdUdEaGhtdXhRVnJoaG1ZanpjRkZkbEtrOWE2SjhkV28vSGM0YTZoU016TFhERE5kaXV5RmE0WU9HR2E3RmRnclhEQnd3elVsZGdyWERCd3d6UlFWcmhnNFlab3JzRmE0WU9HR2FrcWRnclhEQnd3elhZb0sxd3djTU0wVUZhNFlPR0dhN0ZkZ3ExR25RcU5QMmxKUVZxbzA5bFJwKzJhQXJjUkdod3d3S1ZBS0VVUlVWZkFsZ0M5VVdBWHg2UGo0Q2NRQ0xDVGZQQm1lVlVEVmZhR0x6VXo4SFdvbjV5RGZncmIwemN4em5YcFJtcnZwZklHc2FRbU5pNDFMalVER3hqUkxqVmJqVUZ3VnNsd1hFZFFXb0toSm5HSjBKeFdaNXdEVkpXcXhNVHlGUk1hR05Fek16VllKdUk2ZkNLdFJvWVF6ZFlCYWdxTklTK2Q5S0xqVUZvcll1STZweFJxQzRNYUpjYWx4cUMxR2dYR3FYR29MZ3FFdUk2bHhxQzFDS0FsRlFLQ1ZCUUFsRktBbEpTZ01ncW9pbndVaWdFWkFVcVNwMkJTZW5lRE95Vk93THJIM0pHbWlWUE95cGpsUUg5cCs2SDl2QlUzZUNwNTRBL0xUYlJlbmhLbllxZHZZRWMrK2ZKMW53VlBQRm44dGdXT3ZlVS9IbFpVem9WTWNxQmVjZTBqRVg1UDVUb1ZNY3FyY0NaaWE3dzFPdWsvNFNwbnJIM0t6RXoxajRWRDhzVk9rL3N2cFV4M1NZbXUyWXJYL0FBc1pyYm5QSzUyQkppTDl6LzE4azZlWjdmNVdZbTdqcnFsVG5sbjdId0JlMHdkZkgvYVRmV3VmUmM4OFJpdWFLbjl2Ri9EVzJ6T1p6OGZkeitXd0VSWDVUR3k5Zkg2U3B1OEZUZDRBL3Q0WHI0U3A1NHY3Z3FlZUJDZjlYaHJyV3pOVGQ0cy9sdDdGSWl2eW1ObHVJbndsVGQ0WFBQQUVkZDVWTTdHZGdVVE94bllGUXpzWjJBUmM3Sm5ZQU03SjhBaWtBQUtDS0tBQUFDQW9BQllBQ2dJb0FBQUFvQ2dxQUFDS2dKelNvNzk1dHBFVUFBQUFBQUFBQUFSUUVGUUJGS0JCYVFCRlFFVkZBVkZBVkFGRThBS0FBQUFxQUtJQW9mQjhBQUFLQ29LZ0FKelRNZHRFRzBCUVJVUUFvb1VBcU5BQXFDdG9BRHhCV3dCWld4UUFWR2lZQmJTeW9LZ0ZRcUVCUzBvQVFBUUJVVUJGRlJRQUFGUlFTMUFBQUVVQUFBVUFCUUVCSlNjUUtXWHNZTEJZYVppY3RLaUFJQ0FLQUFBQUNLQUFBSUFvZ0FnQUFnQWdBQXFLSXFLcW9Bb25nOEFvZUU4QW9lRDVBRXp1QW9lRHdDaWZLZ0FBcUJRRXBQSnBrR1lscG1nR296YlRuK1BOMFZBU3hCVUFVQThBQjRQRWdDZUpQRWdvbmlTOXBBQzlpOWdFVThBZ1hzZUFRQUFFQUFWRkVWRlVRQlZSZHdCWW0yWlhCUkF3V3hBd3hWWlZCUkZBQUFua1FrbGcwek9FNGxCQ2prb014emJTa21hQm9SUUJGQUJBVUFCQUFDd0FMUUZFQUVBQUVBQVZBUlFBQUZSVVVXVVdGNHZQU0o1a0ZISlQ2UkMwQ0lsRktXQUNnaWdnQUF4UE5KVkpVYWlHcVpodEJLV2dFU1dKNXRUTEU4MVZXbVdvUUxMMms2M3NsNG1PL2tGdmFVdmFTOFI0L3dBbDUyb0N5YmlzK2pwSk9lM1VEemZnT2ZhUHZvNVdCc2trejlvQW00WFRkbno2WDNJR1V5cUFkQTZDb0FBQWdBQUFBS0FBcUFxZ2dLQWdvZ0Nsb29LZ0FFOGhRWU9vVW8xRFRMVndDb29pTVR6WmxxZWJNODFWVlphUVg3eVBLQUhrdmMwU2Z1QVd4T3ZNMDdndmtUcW5tZVlMZTU1T3NwcUNscG9Bb2dxQW4vcWdDQUFBQUFBQUNvQW9nQ2dBS2lvb2dLaWlLaXFJQW9BQ0NBcEF5bzJaMVl1UUZ1MVpob1FwUXRGQkZBUlVBTUFBRmdDRmlvQUFBQUlxQUFBQUFnQUNvb0FBQUFBQUNvQW9BQUtDVXRBQVVvQ0NnSVVvQ0NnRkZBZ0FBSW9LZ29JZ3FDaUtpb0FBSUFLZ0FBQUFBQWdBQUNnQUFBQUFBQUFBb0FBQUFBb0FBQUFBQUFBQUFBQUFBQUNBQUFBZ0FBQUFBQUFBQWdBUC85az0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Curt-Strohm-live_ev_24000253	music	f	t	\N	+43 50 991180, +43 3687 214, 621reservations.schladming@falkensteiner.comwww.falkensteiner.com, +43 50 991180 13	2025-08-18 03:00:21.858209	2025-08-19 08:55:14.970217	all	1	12	f	\N	\N
58	schladming_ev_447843	Winkler Bierzelt	WINKLER Bierzelt\n\n22. Klein-Steyr-Rennen&nbsp;\n\nInfos unter 0664/53 11 495\n\n\n\tab 12:00 Uhr Zeltbetrieb\n\t13:00 Uhr musikalische Unterhaltung mit der "Dörflwirt - Musi "\n\t13:30 Uhr Maibaumumschneiden\n\t14:00 Uhr Start Traktorrennen\n\t18:30 Uhr Siegerehrung\n\t20:30 Uhr musikalische Unterhaltung mit " Starke Mander "\n\n\nEintrit € 5,-\n\nBAR mit DJ STRANI - Schießstand - Kinderland - Tombola\n\n\n\n&nbsp;\n	FF Gröbming-Winkl	2025-08-20 08:54:36.273	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRGhBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNZUUFRRUJBQUlCQXdRQ0F3RUFBQUFBQUFBQkVTRXhRUUpSWVJKeGdiR1J3YUhSOEVML3hBQVZBUUVCQUFBQUFBQUFBQUFBQUFBQUFBQUFBZi9FQUJVUkFRRUFBQUFBQUFBQUFBQUFBQUFBQUFBUi85b0FEQU1CQUFJUkF4RUFQd0RLb0FvQ0FxQUFBQ2lDZ29JSmlnSmlnQ1lvQUlvQWxOS0MrRGpFMEZYL0FHbEFGMWRaVVFFMWFDQ29CaUtBcHFibkI4aWdHaUxobks2QWlVS0tUcFVXQXJOYXJBSXFLcUFBQUFBS2dpb29BQUFBQUFLSW9JQUNrRUZLS2dpaUtDR0tDbUl1c2dvdS9GUzNrUXhiK1UxY29GaVljcHFpbTRtbEF2SzhJVGtGWEVuYTlWQnBNVFYwRXlvMENzdFJGOFFFcksxQUFYRlJGRlJXUlNxaUtnQ2dpQ2dBQUFLZ0FvZ0tJb3FDb0lhQUExaktnR3BVRlVpYWFxS2lVbllOUzUrVitxK3hNaTdQZUF6OVYrR1hUSlUrbjVCbWR1aVpKeXp0QmVlZms5TXpTWGo5SDVCWjdvdExpS2tuU2EwejVCZFRUeWdMdXRWbjArNVFLaEY0QVRsY1JVWFRVVkFBRk1SUlVRQUFGQkZBQUJBQUFCRkYwUlFGeEZpQWVGd2dxTStudHFzZFZVZFBQNC8yeGU2ZlZVN0JmRi9EV2NlMVozbjdONkNmVDhwZlMxOVVQcWdKSmpTVDFLQ2VycGp3M1pxV2Y0Qmx1Skp4MGlEYUVxaXMycDhyWWxBOElBTlRwS3Q2WkJlb0NkcUw5cWFuaFlCaHliN0pxQ3FpZ2lOSmdpQzRVRUFVVTFBRkVBVUFFRkFBQVdSVHlJb1FRRXJPVnE4RzFVWkdwZWVXOGs2QmlTK3haZlpzQnlhazJOcHhPQUpKRkV2VkFsMVhPZHJhRGZqaGpmQytFaUM5TEt4MjFmY1ZwbXhkOEtJd1JyR2NCZkh6V1dyVUFRTjUwRnY2T3A5eGFLeXZSaUtLQ29BQUJSTkVFVUJCYUtJQUNpS0FBQUFndW1tQW9DWnY5QWIrVDhKbVJGUmNpN25udnhmQ1JOQjAyengvbFBxbnNrNXFlUWEyM3FHVzlydVNMTG9DZXJwZDJzK3F6b0VuVno0V2VsT3MvbHFYUUxOVDZmbG9CakZqU1VHR3BmZEJCdEtBSmhpZ3JPR05Kb0U0UnBNQlBCMFgzTlVGWjBRYUdSVUFWRkE3VUVGUVFCUVFVQkFBQXd0emlBZlZuQzc4L3dDR1Z6NFVYWmUxMzdzWjhuSU40ell5dXdEb08wQTFkeENndHVyS3lRR3B4LzN1bDVxK0orVjlQWUpkL1RYcDZMTHE3QUwwemI3SDFScmlneGJmQnBabFpvS1JDQTZJcUlxV3B0S3Y5cWhwRWE2bjNSV2tTVlFHV2tCa0JRQXdRVXhjeEZXY0lmSlFSQUVGUlFGbnlTNTJ6elFYVHJzNlpVTGJRYXpBTU4zZzNTUUZUdjdmczcrMzdFQm1ycTUvUDZCSXVRa1ZRbnBMNlYzRStwQkpHcjZXT2xtM3lEV2Nmc2tUUFYvMVRtZVZGOVNKYVFGRUFYdnRtcVhud0NMaE8yclBZRUJFVVZCUlpPVnZhY3dRWHFHL3orMHFBMGw5UzFudFJWUVFVQUJVQVZQQ3BSR1ZpS0RTV3hFNDhnWnZaYjdGMUZBR3NCTldYV2ZMVTRBTy90K3p2N0NCVWhTZS9qOWd2WDM4QjhxQXBGRlp2VERmcTltY1ZFVU9BYTQ5NHpXL3BqR0FndUdDd2k4d2s5K0MrbklJeWFMZ0kzTHJPTlNZRFROaWlLbUo1OTRyTjRCZmxaeHlpZ3lzOXhiN0FsRVVCV1ZFRlJSUVRVRWJZdFhVKzM4QU5TTWtvTFo3TTQzc1VHTnMrVjJVejhHZTRHUVRWQlU3K3lmQ2dDRTVCYzA3L28rUEg3RkJVVUdvcks5UUdiNVlhMVFaZ3BQSDNCMFpzNGFadmo3Z3djbmxwRlo1Ym5NNVFrQmxZbG5KRlJkK2JGNjgxbSs3VTVnRy9Lc1pWbTlVR2tzQkZTSHdvQnFVSUFzRkJnUlZRQUFBQUZUZEEzM005bGtXek91QVlXVmRubEw2UWEyWHRtb0FLaW9LSW9KbDFmaWZtblgzL1FvQUFxb0FzVDFYdzFIUDFYZnlES29BdXR6OWY5L2JFZFBTRFRONi9NYVo5WFNERjcvbHJXYXlxdGs3WjBsNUN1bG1zT2pIcSt3Z2s0dUxLWHhRYUdMZVQ2cURRenRiUVFHZXhUZFZNeFJGblNYMi9rMnhBUUZrVUJySXFLemk0MENPZVhXNU1PRTFScG1uSzhvTUpMaTJZaWpXeTk4SmdTMkFZRnUvZEFhWHI3K0UrYW5mS0FxS29vaEFhd3hWQm04U3VkZFBWMHhLREkzc09BU04rbnBqcHVUZ0ZTOVZVdlZ4QmlxbmcwVXd4ZFJSdWRDVHBwQnpYUzhYN25Db1pxWjhLYUNaOE5RMU9kQnBGRVZraW9Db0FHTGlzMnFqUUNLRnVNMnAzMklhdXhPQlJxY3RkT2ZWTFFMZFFVQVJBVTFBR3V4STFnSW9BTENSb0FCQlBWMDV0K3BsUk9SVUJaanBPbzV5T2dDS0lPYUxlMFVGUlFiblNvcUt6NnVtSFJpcWliUUFHNHkxQVZGUkZBQVJEeXZZaGF5cXlLS3piNFcxZ0FGazM3QXNubThUOXB2dHd0dXBJQ2xGazBFa1hHaTlJT1lvb21MUFNzbkxZTXlLb2dBQUFBQUF4ZTBielUrbFJrWEtnTDZlMjJmUzBBaW9nbG1zNVd4UmdrYkFBRUJMTlVCak1SMFRJb3lzTVVBQkZBQVRFeHBCRWFBR0wyZ0tEWC9uK1FCR3Y5QUNOZW5vQWFTOUFnd3M3QlJwUVJRQVFRQVVBRVVBQUFBRkFBQUJCQUFBQUFCUUFBQUVBQUFBQUJBQWYvL1oiIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Winkler-Bierzelt_ev_447843	culinary	f	t	\N	0664, 024, bmingkdo.024@bfvli.steiermark.at, 08.2025	2025-08-18 03:00:21.858922	2025-08-19 08:55:14.971332	all	1	12	f	\N	\N
56	schladming_ev_25038592	25 Jahre Andy´s Treff	Wir sind für Dich da Telefon +43 3687 23 310 E-Mail: info@schladming-dachstein.at WhatsApp	Schladming-Dachstein	2025-08-23 17:00:00	\N	https://www.schladming-dachstein.at/static/img/logo.svg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/25-Jahre-Andy-s-Treff_ev_25038592	general	f	t	\N	Kontakt	2025-08-18 03:00:21.857628	2025-08-18 03:00:21.857628	all	1	12	f	\N	\N
38	schladming_ev_24262083	Gröbminger Kulturmontag	"Sir" Oliver Mally &amp; Peter Schneider\n\n\n\t"Sir" Oliver Mally (Gitarre, Gesang)\n\tPeter Schneider (Gitarre, Gesang)\n\n\nEintritt: VVK 20.- / AK € 25.-\n\n5-Tageskarte: € 85.-\n\n\n	Museum Gröbming	2025-09-01 20:00:00	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMyMiIgdmlld0JveD0iMCAwIDQwMCAzMjIiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRkNBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNRUUFRRUJBQUlDQWdFRkFRRUFBQUFBQUFBQkVTRXhRVkZoZ1FJU2NaSFI4S0d4LzhRQUZnRUJBUUVBQUFBQUFBQUFBQUFBQUFBQUFBRUMvOFFBRnhFQkFRRUJBQUFBQUFBQUFBQUFBQUFBQUFFUlFmL2FBQXdEQVFBQ0VRTVJBRDhBb0NvQUFJQUthZ0NnQUFBcUFLQUNBQUNwaTRLb0NDV0psYUZHY0xHZ0daTmFGUUVFMEZSQlFaYUtJeXNtalVBeFFSUkJOVUVBUUFBQUFBQVJRRkFBUVVFRkFRQURWUlFBQUFBQUFBVUFWQlZCTlFVUUJVQUZWbFFHVjFGQUFRUlVCVjFrQnJVMUFBQUFBQnJJVHBRWnNScEtDQ2Fid0M2em9pYU9nQ2lLaWdJQUFBQ29BdWlLQUFBaW9DaUFMb2dDZ2dMcXNyb0tob0FDQW9nQ2lBQUFBQUFBQ3lhallKaVkwbW9wZ2F6YUNwYW1vQWlnQUlEb2dLZ0FBQUFBQUFBc1JRQUFBQVFXQUlLZ0FBQzRpNkJoaHBvSUFBQUFBQUFBQUJqUUFlVloxbTFGYnRZL1VaVElDYng5Z0FCKzZnbUNpREs0dUFLQTBnQUFBQUtvTWltQWdMZ0tnQUFBQ0FBQUFBS0lBQUFBMUlDU0xpcFJVUmNNRVFhVFpBUVdYV2FhTHNaMEVVTk1YSUNhY3FhZ25TbGhnSXE0QWdvb2k0QUFwaW9ncUFBb0l1Z0NpQUtJSW9BcUFBSUtBZ29DQ2dJS0Fpak84ZzJHcHFLcUFvcUROb2kvcVo3RlJVd1hzQk1VRUFBQWtVVUFBQUFBQUFBWFJoZEJwR1pXMVJGQUFBRkJCVTh4UllnZ0NvQUFBb0lBQUFBQUF3MjVwUjBHZHVJYUx2by9WVUJUdFpZaXdGMzB5cUFMejdRUVdIbEFGRWpTZ0FBQUFCb0FtZ0tKeWZZSUFDTnlzazlnMkdpb0FxS2lnQ0NwY0FEV2ROR3F6cUtCcHFBSzFyQURlakNndHFiYUJvY3N0TWdzVkl1b0Nwb29DQUtBZ2hnQWFpbXFORE8xTm9OOG4yeDlnTi9hY01tQTFzTlp4Y0EwM1FnRzFHcWdHTGxVQk1KTVVBWjB0UUd0NE5aalFMcHFDQzZXTXFDNXd5YW9JcUtBaHdmU2dCcUFJc1VNVTN3UkJjVE5YbjRSUlBPTC91aWRsdWRBcDdObWNmNzJYS0RNYTZaWHNEWjgvd0FGVERrRStoZVZCbHFNci93QUZrQk5NYXlGK0FaNkZ6MnVBeU5XVFUrZ1JZWXN2b0V2OENoaWdnSU0ybHFBb0FOWndpb0NpQ0NpQUNwcTZDQlFGVEZGRU1YUGhFRDlsNldUbmZSOGdtTDBxVVUvcEZxOWNxSkp5bGxhL0h6U2lNem95K1Z0NUJVbnJwcThSbGQzZ1JPK0ZzNGllbXIzOUF6bXRaRTMwczZCbkdwNzlSTFY4QW1KaHVMeGZJSGYrLzhBQlp4R2JBSmM4Ti8wNXJ1Q3J6NUQxVkVUbjBuVFNUc0VWYXpuUEtnemFhaUFxQUtDeUFzV1Fsd2w1b0paaUxRR1ZGUVRCVDRBemVHc3c2WlVhRWhRalVac25henBLQlBoV1kxaVZSVXo1TUExbTB0UlVyVXZoYXhMeTNzQmpTRkFEeWFRRmlzb0J1TmF5b3NYdW1zZ2kxQlFKVjNoQURROGdOVHFOTXpwZEFGMHdFVHlxZVFZd3hkTkF4TXBweUN5S2dnUW5GRm5jVVB5cWF2NWRzZ3VyeXkxeWdKMGFBYWVBaWpSU2RKUVdYUEJiOEpPNHQ3RkoyVVR1aU5jczc2WDRadkNLdTZjZW95S2pXUlpuaGpWUlNuaHFaZVN3MUdHcDM5SmhQS2loT3FnSXFLRVJZbFdBbFVBSUFLQWdqWDEvd0JhWm43S0NxZ0NwZ29PY1JaMmdDeUkxSkFDY1NoNFFaYW4va1o4TjlSUmxGUVdpNm1nZ3FMbEJGblZYQzlZQkVwcE8vOEFjQTErUG1yMU45cGVJZHlBdXN5OHJrU2RnWHFzdDNwa0JGVHlDd3hHb2lyMHFJQldXdTB2RlZEK1JyZUdRUUFCWjBpaTFGU2dpK1R3Z0x3WGoySEFpNVBiU1RQU2dBQUtnREhrYWtaQkZsT1RBTlBCaFprQkl1cEFBRkZpL3BYSVJSRVVBR2EwelFSZWtWQk5XWHduOUVVYlozbG9CTDB5MVdRRUYvc0VWQVdLdVZHckxRU1hoTHkxSkFSbVgwcy9acG02QzhNZVZ5cmdJTlpEb0V5cG5sZCtFQVdTZVdWQnJJWkV6NWFCRkFBQUFBRSt6SW9Ca0FCRXJUUDVkQXpEeVFvQUFzYW5iVERRVlFCQk1VNDhnbWNsTjVVR0ZoZUVsNUJzQUVyTFY2WkJQSXZsQUFCWU56cGhZRFlBZ0FBQUFBQ1laRkFSUUFBQUFBQUFBQUFBQUFTOGdET1l1SmJ1NHZJSEVTMWNwZ0pMaHJXR1FHZVZrYUFHYTBsQm1keHRpZHRnTVh0cG04ZzFPVllob05YcGxmQ0FlVThDZ2dpaXdCclBvR2hKeDVVUUFBQUFBQUFBQUFBQUFBQUFBQVFVRUZBRXhRRXhRQUFBQUFBQVNtczJnVHRyY1pYQU5xWldnR2NNYU1nSmVvalNZS3lwZ0lubGVCQVdWZFFBV1ZBR3huVjBGQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCTU1pZ0lvQUFBQUFBbDRCTHdoeitTNERLcml5QW1Ma1VCTEV5dEFNNVRHZ0FBQUFFVUFBQUFBQUFBQUFBQUFBQUFRRkVVQUFBQUFFQlJGQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFQVVRQUZBQVFGRVVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRUFBQUFVQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZi85az0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Groebminger-Kulturmontag_ev_24262083	culture	f	t	\N	+43 676 6366842, 025, 6366842vierglas.kultur@gmail.com, 08.2025	2025-08-14 11:16:44.103424	2025-08-19 11:10:06.549253	all	1	12	f	\N	\N
75	schladming_ev_23167121_today	Von der Kuh zum Käse - Käsereiführung	Erleben Sie die traditionelle Käseherstellung hautnah\n(Weekly event - please check website for exact dates)	Bauernhof und Käserei Hüttstädterhof, Ramsau	2025-08-26 14:00:00	\N	https://www.schladming-dachstein.at/A-Z_Liste/Grimming-Donnersbachtal/A-Z/H%C3%BCttst%C3%A4dterhof/image-thumb__1330549__mainimg-touren/huettstaedterhof-c-martin-huber-3043.webp	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Von-der-Kuh-zum-Kaese-Kaesereifuehrung_ev_23167121	culinary	t	t		025, info@schladming-dachstein.at, Web: tschwww.huettstaedterhof.at, 08.2025	2025-08-18 13:17:32.182592	2025-08-19 11:11:12.040321	all	1	12	f	\N	\N
39	schladming_ev_23690150	Women´s ReConnect mit Wildkräuter & Yoga	\N	\N	2025-08-19 00:00:00	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/06%20-%20Juni/biYou/image-thumb__2443018__teaser-row-sm/Women%27s%20ReConnect%20mit%20Wildkr%C3%A4uter%20%26%20Yoga.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Women-s-ReConnect-mit-Wildkraeuter-Yoga_ev_23690150	wellness	f	t	\N	\N	2025-08-14 11:16:44.104891	2025-08-19 11:24:18.990681	all	1	12	f	\N	\N
40	schladming_ev_22388447	Schladming-Dachstein Nights | Band Bruther | Die Grahms	\N	\N	2025-08-20 00:00:00	\N	https://www.schladming-dachstein.at/Events/Ramsau-am-Dachstein/Sommer/Schladming-Dachstein%20Nights/2024/image-thumb__1845676__teaser-row-sm/Music%20Nights%20Ramsau%202023.png	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Schladming-Dachstein-Nights-Band-Bruther-Die-Grahms_ev_22388447	music	f	t	\N	\N	2025-08-14 11:16:44.105921	2025-08-19 11:24:18.992395	all	1	12	f	\N	\N
35	schladming_ev_17125288	Traditioneller Frühschoppen mit den "Oachkatzln"	Wir sind für Dich da Telefon +43 3687 23 310 E-Mail: info@schladming-dachstein.at WhatsApp	Schladming-Dachstein	2025-08-17 11:00:00	\N	https://www.schladming-dachstein.at/static/img/logo.svg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Traditioneller-Fruehschoppen-mit-den-Oachkatzln_ev_17125288	general	f	t	\N	+43 3687 24 200	2025-08-14 11:16:44.101644	2025-08-17 23:35:45.071923	all	1	12	f	\N	\N
34	schladming_ev_19491413	Berghaus-Fest mit Messe	Wir sind für Dich da Telefon +43 3687 23 310 E-Mail: info@schladming-dachstein.at WhatsApp	Schladming-Dachstein	2025-08-17 00:00:00	\N	https://www.schladming-dachstein.at/static/img/logo.svg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Berghaus-Fest-mit-Messe_ev_19491413	general	f	t	\N	Kontakt	2025-08-14 11:16:44.101036	2025-08-17 23:35:45.056393	all	1	12	f	\N	\N
36	schladming_ev_25245496	Frühschoppen im Schwimmbad Mössna	Wir sind für Dich da Telefon +43 3687 23 310 E-Mail: info@schladming-dachstein.at WhatsApp	Schladming-Dachstein	2025-08-17 11:00:00	\N	https://www.schladming-dachstein.at/static/img/logo.svg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Fruehschoppen-im-Schwimmbad-Moessna_ev_25245496	general	f	t	\N	Kontakt	2025-08-14 11:16:44.102254	2025-08-17 23:35:45.068923	all	1	12	f	\N	\N
60	schladming_ev_24924660	BREEMA Harmony Bodywork und Zen Meditation	\N	\N	2025-12-31 00:00:00	\N	https://www.schladming-dachstein.at/Events/Oeblarn-Niederoeblarn/image-thumb__2581210__teaser-row-sm/breema%202.png	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/BREEMA-Harmony-Bodywork-und-Zen-Meditation_ev_24924660	wellness	f	t	\N	\N	2025-08-18 13:02:33.010386	2025-08-19 11:24:18.97385	all	1	12	f	\N	\N
43	schladming_ev_25157952	Heimatabend der Volkstanzgruppe Ramsau	\N	\N	2025-08-20 00:00:00	\N	https://www.schladming-dachstein.at/Events/Ramsau-am-Dachstein/Sommer/2025/image-thumb__2596372__teaser-row-sm/tanzgruppe%20ramsau.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Heimatabend-der-Volkstanzgruppe-Ramsau_ev_25157952	general	f	t	\N	\N	2025-08-14 11:16:44.11571	2025-08-19 11:24:19.002175	all	1	12	f	\N	\N
46	schladming_ev_24645311	Heimatabend – Volksmusik trifft Gedichte von Peter Rosegger	\N	\N	2025-08-20 00:00:00	\N	https://www.schladming-dachstein.at/Events/Ramsau-am-Dachstein/Sommer/Peter%20WIll/image-thumb__2560290__teaser-row-sm/Foto%20Schober%20Viergesang.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Heimatabend-Volksmusik-trifft-Gedichte-von-Peter-Rosegger_ev_24645311	music	f	t	\N	\N	2025-08-14 11:16:44.11793	2025-08-19 11:24:19.011058	all	1	12	f	\N	\N
62	schladming_ev_24750595	Qi im Kneipp Park	Ab dem 11. Juli 2025 lädt PSB jeden Samstag von 10:00 bis 12:00 Uhr zum neuen Outdoor-Angebot ein:\n„Qi im Kneipp Park“ – sanfte Bewegungen und Atemübungen für mehr Energie und Achtsamkeit inmitten der Natur.\n\n📍 Ort: Kneippanlage, 8960 Öblarn\n💶 Beitrag: 15,00 € pro Teilnehmer\n📞 Um vorherige Anmeldung wird gebeten!\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Öblarn","postalCode":"8960","streetAddress":"Öblarn 311c","email":"info@psychosozialeberatung.org"}	2025-08-20 08:54:25.829	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDQwMCAyNjciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUxBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNnUUFRRUJBQUlCQXdNREJRRUFBQUFBQUFBQkVURkJJUUpSY1dHQndaR3g4Qklpb2RIeE12L0VBQllCQVFFQkFBQUFBQUFBQUFBQUFBQUFBQUFCQXYvRUFCWVJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBQUJFZi9hQUF3REFRQUNFUU1SQUQ4QXdBQlVWQUFBQUFBQUFBQUFBQUFBRlFBQUFBQUFBQUFBQUFBQUFhMnN0YjlnWGM5MDU1cHFBVDlRMUFXNmlvQUFBQUFBQUFDZ0FJb0NBQUFzbWdnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBS2dBQUFBQUFBQUFBQUNnSUFBQUFBQXFBQUFBQUFBQUFBQUFBQUFBc1FBQUFBQUFBQUFHcG1iOVFTWjMveEJRUUFBQUFBQUFCVVVFRkZBQVJBRVVBQUFBQUFBQUdyTW4xWkFBQUFBQUFBQUFCWXZxU0ZCQUFBQUFBWFA5cldwZkcvUmkzOXdMMThJQUFBQUFBQUFBQUFDb3F3QUJCVW9DQUlvQUNvc0FRVkFHcDczN0VMN0FsdW9BRGNuK1l3M1BFK1Fadk5RQVhQR28xT0dRQUFCWXZxNkJscjhzcUNDbWVjQlo2ZDg5RjlPY2VXdUo4ZUdRWmF6WlB1bDVhNG1kOWdsOXZabFVBQUFBQUFBQUFBQUFBVkZCVUVWQUJGQUFBQVdJc0FPa1ZBYWlWVUZXRlZPZkFKUEsxWjQrVW1YN0NNcUxlUUp4K3JMVS9KblBYa0dWelhUSjdKWko1Z015ZVV2TFh2KzZVR1ZuSzNqRW5NQlo0cTNObFMrQVV0UnJua3pzQ2VKdmQ0U2VhMWNzVGliL1A1UVcyVGp6WE1CQlYvcHBlUEhIN2duS05UaGtBQUFheGtBQUFha1pBQUFBQUFBQUFBQllJb0FBS2k4Z3E1cktvQ3BGZ0NOenUvWm05TG9KTzEyZVBqL0FJaUNOV25WWktDOUU4MUlzRktrNVdwQkc1d25hemlpS2ZLZXBXYUJQSmF2UlA4QVA3S01MSnRhdlJ4UEFpMnNXOExhU2FLZEpsYnllNS9iUHFJeEpxNWk3Zmlmemd2cUJKeWxKeTFtZ3dMWmhKdEJkdU1yYjVRQUFBQUFBQUFBQUFBQlozOEkxT3dFVVJZZ3BWRUFCU1RVMEFwZkN6bExkb2dWQUdsT2pCVG5sTzR2U1R2NEJyOGxPb2xSVTc4bDVXYnpqS29MTktkQ0hhTENpbFJVRVVEWUtheXRRUlp5MUxqTWJrM3dDWHp3Y1RETVpvcUFDQUFBQUFBQUFBQUFBQ3lvQTBnQzZwVVhmQWFnR0FBdCtBU0kweUlLZ0RacVJZQmI0VDA4L0swOU9lUWFSZVV2ODhJMG5udng5RTdYWjhwMnFGTDRYdlBjOVFVbkdwU1h3V2lJQUM5SUFDS2dEckxqazZnYTVPbGN3QUFBQUFBQUFBQUFBQUFGaUFMUUFSVVVCZWtBSXRJWGtVK3JMcGVQczVpQ2dDemxydU1OZGFLdWVXZjl0ZC9aSi82QjBZOVRhVkVjL0d4Y2pOZEptQ3BlR0hTNDVxaEJGQkZRQlVWQVZBQnIwenp2czNXZlQyMVFackRwSXhlUVFBQUFBQUFBQUFBQUFGZ0lMVUFBQVZBRldUeHFMMVZDVXZTTGZ3aXRXK1BzNXRkVmtSVVZBVnFNZ3JVNVR2ZnFnRHN4YXQ4UmhCYXZwWldYQWF0YzYzYkdPeEF2NE94UkJjUUZSVUFGUUcvVDIwejZlMUJXUFZ5MTJ6NmdaQUFBQUFBQUFBQUJRUlNSUUVVd0dWS3N6QVpXRldRRVhCUVp4ZWRXZGt5YjhBakxXVEVnQ05aTVNBRFdleGdJVDhyaGdMNm1XdlV6aUtpd3c0VkJPMU1CSnl0SlBKWlFMd3kxbThKZ0NMaGdJTGhnRXVWdStHTVc3MkJ2MExkaUFJQUFBQUFBQUFxS0FBQUFBQ2dpZ0FBQW9BSGswMEFOTkF4Wk1OTkF3dzAwREREVFJTL0o1QkF4UFYwb296R3NUOUYwUXd3MDBFd1hUUVFYVFFCQUZQQ0FHUmNpQUxoaUFHR0FCaGdhQmlZdW1nd0FBQUNpQUtJQW9pZ0FBQUFvZ0NpQUtJQW9nQ3FnQ2lBS0lBcUFBQUFBQXFBS0lBb2dDb0FBSUNpQUtJQW9nQ0FBQUFBQUFBQUFBQUFBS2dDaUFLSUFvZ0NpS0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0FvZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFELy9aIiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Qi-im-Kneipp-Park_ev_24750595	general	f	t	\N	025, +43 650 22, 742info@psychosozialeberatung.orgwww.psychosozialeberatung.org, +43 650 22 12 742	2025-08-18 13:02:33.043737	2025-08-19 08:55:14.964938	all	1	12	f	\N	\N
49	schladming_ev_451243	"Sondercombo“ in der genießBAR im Falkensteiner Hotel Schladming	Die Sondercombo live!&nbsp;\r\n\r\nHandgemachte, urige Musik mit Texten im Dialekt! Lauschen Sie den angesagten Ennstalern live &amp; unplugged in unserer Hotelbar.\r\n\r\nDie Sondercombo – Die Zukunft des Austropops: handgemachte, urige Musik mit Texten im Dialekt, Gitarre, Schlagzeug, Harmonika und Kontrabass als musikalischen Klangteppich! Die angesagten Ennstaler live &amp; unplugged im Falkensteiner Hotel Schladming ab 21 Uhr in der Hotelbar genießBAR.\r\n\r\nEintritt frei!\r\n	Anreise Falkensteiner Hotel Schladming Europaplatz 613 A-8970 Schladming schladming@falkensteiner.com +43 7203 0382 563 In Google Maps anzeigen	2025-08-20 08:54:17.593	\N	https://www.schladming-dachstein.at/Easy-Edit-Mode/schladming%40falkensteiner.com/Events/sondercombo-451243/gallery/image-thumb__600787__masonry/336048836-2106wl_falkensteiner-schladming-bar_-9273.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Sondercombo-in-der-geniessBAR-im-Falkensteiner-Hotel-Schladming_ev_451243	general	f	t	\N	0 991180, 025, 13schladming@falkensteiner.comwww.falkensteiner.com, +43 (0) 50 991180	2025-08-14 11:16:44.119904	2025-08-19 08:55:14.96083	all	1	12	f	\N	\N
63	schladming_ev_5597015	Großes Almfest mit LIVE-Musik - "Murtaler Kirchtagsmusi" & "Schoffeichtkoglposcha"	Am vierten Sonntag im August findet jährlich das große Almfest mit LIVE-Musik auf der Schafalm statt. 10-13 Uhr - "Murtaler Kirchtagsmusi"ab 13 Uhr - "Schoffeichtkoglposcha"Murtaler Kirchtagsmusi": Ein Name, der nicht nur eine Musikgruppe, sondern auch gute Freunde beschreibt, die eines teilen: Die Liebe dafür, Menschen mit echter Volksmusik, Oberkrainer und vielem mehr zu erfreuen und ihnen ein Lachen ins Gesicht zu zaubern. Die drei jungen Burschen aus der Obersteiermark trifft man in ganz Österreich überall wo es etwas zu feiern gibt. "Schoffeichtkoglposcha": 2007 hat der ehemalige Bürgermeister von Wörschach Ing. Franz Lemmerer alle Wörschacher Jugendlichen im Alter zwischen 16 und 24 Jahren zu einer ersten gemeinsamen Probe der Schoffeichtkoglposcha eingeladen. Ziel der Zusammenkunft war es die hohe Kunst des Poschens an die jüngere Generation weiterzugeben. Schof = Schaf, Feicht = Fichte, Kogl = geologische Erhöhung, Poscha = rhythmische „Klatscher“; wobei der Name Bezug auf eine Erhöhung in der Heimat der Wörschacher nimmt, den „Schoffeichtkogl“.Tischreservierungen sind über die Homepage "www.schafalm.at" oder via E-Mail unter info@schafalm.at möglich!#netmuhsondernmääh	Anreise Die Schafalm ist mit der Planai 10-er Gondel am einfachsten erreichbar, alternativ kann die Schafalm auch mit dem PKW über die kostenpflichtige Planaistraße (13km lang) erreicht werden.Die Sei	2025-08-20 08:54:42.176	\N	https://www.schladming-dachstein.at/Easy-Edit-Mode/info%40schafalm.at/Events/Gro%C3%9Fes%20Almfest%20mit%20-C%C3%A4pt%C2%B4n%20Klug%20%26%20Die%20ZwergSteirer--5597015/gallery/image-thumb__2392258__masonry/2521649083-Gruppenfoto.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Grosses-Almfest-mit-LIVE-Musik-Murtaler-Kirchtagsmusi-Schoffeichtkoglposcha_ev_5597015	music	f	t	\N	007, 048970, info@schafalm.at, +43 3687 24600	2025-08-18 13:13:43.313144	2025-08-19 08:55:14.97367	all	1	12	f	\N	\N
66	schladming_ev_24645312	Heimatabend – Volksmusik trifft Gedichte von Peter Rosegger	„Musik: Flügelhorn-Trio, Lesung: Regina Leitenmüller“\n\nPremiere der diesjährigen Literaturkonzerte in der Evangelischen Kirche in Ramsau. Unter dem Titel „Mein Name ist Mensch, meine Losung ist Fried“ (von Peter Rosegger) liest Regina Leitenmüller Gedichte des bekannten Heimatdichters Peter Rosegger, dem „Rilke“ der Steiermark. Die Gedichte werden musikalisch begleitet von einem Flügelhorn-Trio aus der Region.\n\nErleben Sie sich zum Abschluss des Tages die einzigartige Kultur des Ennstals und der Steiermark. Für Seele und Gemüt.\n\nZeit: 20:15 Uhr, Dauer 1 Stunde\n\nDer Eintritt ist frei!\n\nEin Angebot der Evangelischen Tourismusseelsorge der Evangelischen Kirche in Deutschland (EKD) in Zusammenarbeit mit der Evangelischen Pfarrgemeinde A.B. Ramsau a.D., dem Tourismusverband Schladming-Dachstein und der Ramsauer Verkehrsbetriebe mit Unterstützung des Kulturausschusses der Gemeinde Ramsau a.D.\n\nNach der Veranstaltung steht der Tourismusseelsorger der EKD, P. Will, noch für ein persönliches Gespräch zur Verfügung.\n\nKostproben der Gedichte von Peter Rosegger \n\nEin bisschen mehr… \n\nEin bisschen mehr Friede\nund weniger Streit,\nein bisschen mehr Güte\nund weniger Neid,\nein bisschen mehr Liebe\nund weniger Hass,\nein bisschen mehr Wahrheit,\ndas wär doch schon was. \n\nStatt so viel Hast\nein bisschen mehr Ruh’.\nStatt immer nur ich\nein bisschen mehr Du! \n\nStatt Angst und Hemmungen\nein bisschen mehr Mut\nund Kraft zum Handeln,\ndas wäre gut. \n\nKein Trübsinn und Dunkel,\nmehr Freude und Licht.\nKein quälend Verlangen,\nein froher Verzicht\nund viel mehr Blumen\nso lange es geht,\nnicht erst auf Gräbern,\nda blühn sie zu spät!\n\n&nbsp;\n\nIst der Mensch nicht wie die Schwalbe?\n\nIst der Mensch nicht wie die Schwalbe?\nMit dem Lenze fliegt er an\nund verjubelt einen Frühling;\n— heißer Sommer quält den Mann.\nWie die Schwalbe an dem Neste,\nbaut er flink an seinem Glück,\nmuss um seine Reiser, Blätter\nringen mit dem Missgeschick.\n\nLeise kommt der Herbst geschlichen;\nvon des Lebens reifem Baum\nreißt der Sturm die Frucht des Schaffens,\nund der Mensch erwacht vom Traum.\n\nSieh', am Scheitel seines Hauptes\nwird es weiß — der erste Schnee;\nmatt und düster blickt das Auge,\nach, es friert der klare See.\n\nUnd er fühlt ein eigen Heimweh,\nfremd wird ihm die Bruderhand;\nwie im Herbst die Schwalbe, zieht er\nheim ins ewige Frühlingsland.\n\n\n	Evangelische Pfarrkirche Ramsau	2025-08-20 08:54:53.545	\N	https://www.schladming-dachstein.at/Events/Ramsau-am-Dachstein/Sommer/Peter%20WIll/image-thumb__2555050__masonry/Plakat%20Rosegger%20Ramsau%202025%20A4.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Heimatabend-Volksmusik-trifft-Gedichte-von-Peter-Rosegger_ev_24645312	music	f	t	\N	025, Willpw@praedi.de, willpw@praedi.de, 08.2025	2025-08-18 13:13:43.318677	2025-08-19 08:55:14.976702	all	1	12	f	\N	\N
67	schladming_ev_24221176	Brass Konzert " Schmank5 "	​​​​​​Die Marktgemeinde Gröbming lädt herzlich zum Brass Konzert der "Schmank5&nbsp;" ein.\n\n&nbsp;\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Gröbming","postalCode":"8962","streetAddress":null,"email":"rene.binder@groebming.at"}	2025-08-20 08:54:56.201	\N	https://www.schladming-dachstein.at/Events/Groebminger-Land/Events/05-Mai/image-thumb__2379468__masonry/Stoderplatzl%20NEU%202.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Brass-Konzert-Schmank5_ev_24221176	music	f	t	\N	+43 3685 22150, 025, 22150rene.binder@groebming.atwww.groebming.at, 08.2025	2025-08-18 13:13:43.320372	2025-08-19 08:55:14.977605	all	1	12	f	\N	\N
68	schladming_ev_22968412	Blasmusik am Kirchplatz mit der Trachenmusikkapelle Ramsau am Dachstein	Ein besonderer Abend voller Musik\n\nDie Trachtenmusikkapelle Ramsau lädt dich herzlich ein, einen unvergesslichen Abend zu verbringen! Ein besonderer Abend voller Musik und Geselligkeit. Erlebe eine abwechslungsreiche Mischung aus traditionellen Märschen und modernen Musikstücken, die sowohl Jung als auch Alt begeistern werden. Genieße die stimmungsvolle Atmosphäre und verbringe einen entspannten Abend in guter Gesellschaft.\n\n&nbsp;\n\nAm 03. Juli um 19.30 Uhr dürfen wir auch den Ramsauer Jugendklang begrüßen. 😍\n&nbsp;\n\nDie Trachtenmusikkapelle Ramsau freut sich darauf, dich bei den Blasmusikabenden begrüßen zu dürfen. Sei dabei und lass uns gemeinsam einen tollen Abend erleben!\n\n&nbsp;\n	Kirchplatz der Evangelischen Ramsau am Dachstein	2025-08-20 08:54:57.874	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRXNBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNnUUFRRUJBQUVEQkFJQ0FnTUJBQUFBQUFBQkVRSWhNVUVTVVdGeGdhR1I4TEhSSXVIeHdmL0VBQllCQVFFQkFBQUFBQUFBQUFBQUFBQUFBQUFCQXYvRUFCZ1JBUUVCQVFFQUFBQUFBQUFBQUFBQUFBQVJBU0ZoLzlvQURBTUJBQUlSQXhFQVB3QUFBQUFpZ0FpZ0NLQUFBQUNBQUtnQ2dBaWdEVXJUbTFLRFFBQUpiZ0piakdqTkJkVFVBWGFnQUx0RmswQ1ZwbThiRjQrd0ZaYXNaQnFjZW0zc2xuc3Q1ZkgybWdtSTEzU2lvQUlLZ0RVcXNOVHNEUUFBQUFBSW9BaW9Bb0FBQUlDZ2lvb0lvQUNBQ29BM0swNXRhQ3NXNnR1c2dNTjVzWkJCUUVGQURVQVhWNCs3TGM3QVZscXNwZ0lDZ0FBQUFBQTFHV29EUUFJb0FBQUFBaWdBQUFBQUlvQUlDZ0FnQUFxQUFvQUFMR0xGM0diZEFBQVJVQUZPa0FYZW1JMXhtZ3lPbDR4SlBDVldCclAweXFDS2dBQUFBQ3hGQnNBQUFBQUFBQkZRRkFCQUFGUUFWQUZBQkFBQUFVQUJtMVNBa2x0YTlNaEtjdTZMak5tRFhlSUNJMEtJbU5JQ05TNVB0TTFydWcxS2k1MFFEeXpaamRTZ3hoWXFxakEwZ01pZ0lMaWcwQUFBQUFBSW9DS2dLSW9JS2dDb29DS0FnQUFBQUFLQUFpb0FMNFRxS3FLaUFBQWdBMUowV2QyZGFuYlFXc3JVQmZBc1FFUnFzQXFBcUNvQW9BS0FBQUFBQUlvQWlnaW9BQUFLQUFJQ29BQUxnSXA5bSszOS9BQ1g4TDFwa0FSUVZHdkNIM1JFRi9SMCswVkFBTVJmQkFKTlcvSC9BRXVhWXFJTmRJbW9wQTFBWG94ZTdXR0F5TmVuNVp5cWdSVUFCQWJBQUVVQUVBVkZBREVBQUFBQlFBQUw5Z0dJQ3IwK3piOUl1WWdZRzRxaDRRQkdkcEw3dE00RFhXL0FtS2lyWjBZYUFURlV3RXBJbTdWMmU0Tkp1Ryt5WnZkVUF6NVdSSXRNRkZSQlVBVUZHYlBMTmJaeEJBd0JwQUFWQUJVVUFBRTFlLzJsN3BMbFJXc0ZwaW9oMVhwRTlYc0M1N3BzaUNLYmFZTE8rZ2cxY1JVQzNxTTFGVldJMkFBQUFBQ0FvQ29GdHYwWi9mQmVpS3pWbkZaTjYxcFVFVkFVQUFBQkFVRkVBRVZCRE5WRkVBUUFBVUFCQUF2Z3M4eGU4d25ZRThIVlQ4b3JJdVJRU1JlZ3VlNm9pNG15TTI2RFd5SnBscDBuYnI4b3BsdndYUEhYNVBzQW5IelY2ZTVhbDBHOGlNZFdwMUFGcUFncUFmc0JVYmwzN1l2Vy93Q0ZoUGRCWjBtS0NnQUFDQUFxaUFBQUlBSUNwUW9JQUFxS0FnQUFBTitOWWFsOEFoZ3V3RERwTzZYbDdNQTM2dlpuU1MxcnBQbW9yTWxxOUoyNjB1K2Y0VEFYZDduUTZGZ0FMNEJGOEliK1FSZVBTL3BKUHo4TlNYdlFXb3RRQUFCUGhRRHZNbjlqWFlGUVZuVTBGMFJRTlZrQm9aMVFBUUFVQkFBRXFwUUFVQUVBQUFBQUFBWEVhVFZaejJYSk81ZVh3ejM2MEZ0dCtpQXFIbWlYM1h1QTFPc3hNUUZ2UVRQSWlnQUxPN2JtM0xzRUV4b0ZZRnFBZ3FBMXFhZ29BSUJ1QW8xdWpIWnNSQTNEZEFWblZCVU9xQW9tZ0tnZ0txS0FnQUFvSUtnQUFJcUtDZDFBdzBBQUFBQmNCT3k0bFdleG9nQ0tMeHVNcURvSkw0VVJLeTJ6UlVRQUFBQVFGUUFBeHJNQm5Hc1dWZDZBeHBvaW92cThJQUFBQ2hWUlVCRkFBQUFBQUFBUlVVQUFBQUFGa0FpV3RWTUJDR0FOWDNaYW5zelVVUlVCVzVkYzI1UWFTbWxCZ1FBQmNCQmNTd0ZrMjQzNlpIUGozanFDVmxxczBFQVZBQUFCVUFRRkwzQzl3QVhLaW9MbE1wY0VGd3o1TGdndWZKMDl5a1FYcDduL0FCU2tURncyR3dwQXcyZXg2cDdGOEloaStyNFBWOEY4V0xpV3A2dmc5UmRJc1ZuMVU5VkxwRkU5VlBWVHBGNnJlclBxcDZxZERLWlQxVTlWT2hsVHF2cXA2cWRGWHZQbG4xVTlWT2dUTjZucVBWOEExbUNlcjRQVjhKMVFQVjhHejJCUExveHM5bDlVVkdtS3ZxaHM5d1pGNmU1MDl5b2d1VDNNK1Z1Q0M0WlM0TWk1VEtYQUwzTXZzZFFQVlRheUkwdTMzTnZ1Z0NvQUFLQ0FvSUNnZ0FBQUFBQUFBQUFBQUFBQUFLQ0FBQW9JQUFBQUNnQUFBQUcwQU52dXUzM1FCZHA2cWdDQUFBM3htOWFxTXlXcjA5OStpM2ZvazIvWGNGazg1ay9tcGJ2MTRiNVhKbnU1QXNtdDdPUFNkMWt5ZjVjd0hUajJqazZ6cHhEWE85NmlvS0tqZkRPdnVJeWpmUE9qQUFDS0FBQUFBQUFzbTNGR3VNOHRjcmt6elY3VDZjcmR1aUlDeWJjRmE0enl2SzVNOTJ1a24wNVc3ZEVRQkZBQUZBQUFBQUFBQUFBQUVBQWI0M09sWUZSckpQTy9EZkh0dnYxYzNXOUo5QTU4cnQrbDR6cXo4My8xdmo1djRCZVZ5T1RmTzljOW1aUDRCWk4rcDNXMjhya1R2MG5TZjNyVytuR0F4bWQ3L3dEUzhiRms4MzluTGx2U0F6SnEzam5tTjhaa1k1WGI4UUVrM3N1WjN2NmE0SEtlZjVCbThiR1c3eTJZdkdlYURQcHZlOUo4azQ3MnY2VzdiazhMczR6TzlCaHIwMDR6YnRhdHlBeG4vdmhmVGZmVWs5VitQOE9sdVFIRjE0ekp2dXh4bTEwdHlCckhLK0QwM0dlN3IyQnliNHpKdnV6SnQ4WTZXNUFZNVh4L0xNbHZaWk5ycDBrQnpzenZTY2JVN3VzNlQ2Qnp2SFBLU1dyYnRiNDlnWXpybTlmb3NzV3pMdmhPVjBFWFBmbzNKbjJ6MTVYNEE5UFRaV1c3eWttUTR6eUNlbSs4U1Q4TjhyL2ZmL3Buak51MEM4YkdYVGxjbjI1aGdBaW9BQUFEWEdkZnBlVi9Yai9hYjB5ZEdWUlhTZE9MbXR0b0gzMXZ0L3UvNlRVQlcrSGV0Y3R6OHVjdU5lcjNrRVphNHpyMTcrMysyZDlzbjk5eVhPb09uSzVQdG5qUFA4RjViNGpPM2RCcTNyTFBEZmh6MmUzN0x5dEJNOSszK1haeFdjclBrRXRwSnEyNzRpYmQwSFdUSTUyN1M4cldRZGVQYU1XN2Y3L0pPVm5STi9BT25ITTZNY3J0K2tsc1haM3o5Z3ZHZWY0T1hMeFB5bDVXc2c2OGUzMnh5dTM2SnlzTGZ3RFhIeWMvREV1TlhsdmlBY1oxNnJ6dmhpV3k2dDViNGdOY2NrMnB2L0xZa3RuNUpaUEg3QjA1ZHE1enZOL2ovWmVWcUE2M3RmcHkxcjFYN1RmaUFTYTZkSkhPV3d0dEJMZHJyMm4wNU5lcnBuY05TOWIvQUhvbitEUkZBQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCVVVBQUFBQUFBQUFBQUFBQUgvLzJRPT0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Blasmusik-am-Kirchplatz-mit-der-Trachenmusikkapelle-Ramsau-am-Dachstein_ev_22968412	music	f	t	\N	025, Dachsteininfo@tmk-ramsau.atwww.tmk-ramsau.at, dachsteininfo@tmk-ramsau.atwww.tmk-ramsau.at, 08.2025	2025-08-18 13:13:43.321275	2025-08-19 08:55:14.978391	all	1	12	f	\N	\N
69	schladming_ev_17754646	Yoga Retreat - Relax and Move	Ein Yoga Retreat, das Bewegung und Entspannung vereint.\n\nErlebe in dir die Balance von Aktivität und Ruhe auf unserem „Relax and Move“ Yoga Retreat. Inmitten der sommerlichen Berglandschaft begleite ich, Dominique, dich auf dieser Reise, um die perfekte Harmonie zwischen Bewegung und Entspannung zu finden.\n\nWorauf du dich freuen kannst\n\n\n\tAsanas (Körperhaltungen), Pranayama (Atemübungen) und Meditation\n\tEntspannende und dynamische Yoga-Einheiten\n\tBergfahrt mit Lift\n\tYoga in der Natur\n\tFinnische Sauna und Wellness\n\n\n\nWas du benötigst:\n\n\n\tYoga-Matte und Meditations-Kissen\n\tAngenehme Sportbekleidung für Indoor und Outdoor\n\tTrinkflasche\n\tStift zum Schreiben\n\n\n\nPreis pro Person 320,- (ohne Übernachtung)&nbsp;\n\nInfos und Anmeldung unter T +43 664 914 02 19 oder info@dominiquegreger.com\n	Anreise Den genauen Anreiseweg findest Du hier: In Google Maps anzeigen	2025-08-20 08:55:00.097	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDQwMCAyNjciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUxBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNjUUFRQUNBQVFGQlFFQkFRQUFBQUFBQUFBQkVSSWhNVkZCWVhHQjhBS1JvZEhod2JIeC84UUFGUUVCQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUgveEFBVUVRRUFBQUFBQUFBQUFBQUFBQUFBQUFBQS85b0FEQU1CQUFJUkF4RUFQd0RRQUtJQW9nQ2lBS0lBb2dDaUFLSW9JS0FJb0NLQUFBQUFBQUFBQUFBQUFBQ0tBZ29DQ2dJS0FnQUFBQUFBQUFBQUFBb0NDZ0lvQUFBQ1RNUXpNeURZekU4SmFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJMK1J6dVRGSU9pdWVLVnhid0RZemlneFFEUXppZ3hRRFF6aTVKTXpJTlhFSmkyUXFBTVVwTXpLbEF5TkZBaXhQQ1NpZ2JHWXlXd1VTNFc0QUV4UW1Ma0RReGlsY1c4QTBBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURpQUFBQUFBQUFBSVhMV0prRmF4Y2pFeUF0a1RTQU5YelMwQVd5MEFBQVd5SlFCcTRNbVFHNG1seFF3Q09vNXhOT2tUWW9BQUFBQUFBQUFBQUFBQUFBQUFBRGlJb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBZ3BBRGNlcmRweGJqMVRBclpjTTNZRFl5dGdxRndBQUFBQUFBQUFBQUFBNGdBQUFpb29BZ0NnQUFBQUFBQUNvQUFBQUFBQUFBTFVyb0NSemhHcFFFRkFDd0Jia3VVVURQY2laNEhYeit6OEplM25iN3NHcjV5dDkyTG5jdmYzalVHOHVDV256OFNBdHJkTUtEZHdybXRnMkppZ3VBVUFIRUFBQUFBQUFBQUFBQUFBQUFBQUFBRnFRUWFvQktVQUFBUVVCQlFFWHp5RExmenI5SmN6cDhBdVVhK2R2dVV2YjkvT3hIcGFpQVpxV3NNS1NpcFNURFVhRzRNVktYdm02Sk1XRE92NzltbjZ1SFpNK3lvdVFtWG1objVvQ3dxV3NBTlJMSURBb0NBQVpCUlFBQUFBQUFGS2lnRkFCUlFBSXFBcTJ5dkFGdUZZQWJSTG5jc0ZFdGV2bmI3b0E4OC9FdjM1K1VtY2d0eDEvd3pueklwYW5jRXFXb2hLbmRhbmRGWFpXYTVsY3dWWE80M0xqZVFiNERHdTdWQTBNMFZIa2dyTmMxcUVxQVNremhxbzhreThsUkxqL24wZVpmUzFDZEJDMm9sbnIrb0FBQUFBQzZBZ0FMU0MzeUJCVkJrVW9Dd29CQW9BQUFwdUl5N3NXMUVnRkN3REZEY0pWZ3lVdGYxWTA3Z1Z6YXlLeVNkSVJWdU54bUx1TmZJYUEyVk5sQVNkT3lwT25ZSElCVWE5T3ZuTnYyWjlPdm5OcEZTelZQVnIyWDA2VDFCZlpscTJaQW9wbTJzU29UcERMYzZRd0FBQ2xKWUFBQ2lBTFJYTUFScEN3VXRGUVFNaFFXMG9CU2tMUUpoS2FVR0NKV1lSUlczTnErQU5VaVJLOGVvRjVWMVNOTzYwZmNJcThFOVVYR1c0QWtSTnhQOWJaeUptcVZGMlUyRVVTZE95cE9rOUFZcUZ5aE9BcU5RcVJyNXpXMFZtZGNpTFcwVkdvK1daVzA5MFZtaHUwbFVKMGhscWFxRXJQa0NDMGdBZ0NnQW9nQ2lBQW9DS0ZBQlFBRkFBQUMyZ0MyVFNMRW9KUkVLbWFndG9nTldzWnNOUklLdE0yMUVnbEU2TlhETXpJcEV0TUZnM3VuTGRsRUdzTW1Ib3lLalZWUEJMbEFGRVFHckxaQVd4QUZFQWFpWjB0YmpaaG9HRkFCUkxCVVVCRkVCUUFBQUJGQUJBVVJRQkNBVkZBUlFCQmFXZ1NrYVNnUUppbEF1VnRBRkVJQlJDd1VDMEVBVUFBUUFBQUFBQlVVQkFBQUJVQUFBQlVXZ0JBQTRBQ29BQUFBQUtJQTF3QkFVU0JBVzZaVlFzSlFGRUFVUUJSUUVSYWxhQmticUNvQmhXcWd5Qm1ocklxQVpScWdFcEdrQkJRQUVBQUFBQUFBV1FCSkFBQUFBQkJRQUZCRkFBSVVFUmFRRk5BNGdnMVVMbHNESTFrQXdxNUFMQVpnS0lBcUJNZ0lnQ2pJRFF5b0tJQUFXQUNBQUFBWkFLZ0FBQUFBQUFxQUFLQ0tJQ2lwSUJ4RUJRZ2tCWTFaWFFHazNMU2VJTGFzNktBb0FGQ0F2blFFc0E2QUNDMHRBd3ROSUROTFFkZ0tBQkJRRUFBQUFBQUFBQUFBQmFCQUFBQUFWQUJVQUZ0QUFBQVZGQUVBYXJJUUFWQUJVQUZSYkJlcDBSZHdOQ2ZoTExCTkJRRUFBQUFGUUVVQVFVQkFBQlVBQUFCQVVDUVJVVUFBQUZrRUZsQUFrQUJRRUFCUUFEaUFwTE1jVjRBQUFDQUtnQUtnQ3JxaHVBRWNleWNRVUpRRkUrd0gvOWs9IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Yoga-Retreat-Relax-and-Move_ev_17754646	wellness	f	t	\N	+43 664 914, 02 19, info@dominiquegreger.com, +43 664 91 40 219	2025-08-18 13:13:43.322845	2025-08-19 08:55:14.979297	all	1	12	f	\N	\N
59	schladming_ev_25414130	Antik- und Trödelmarkt in Schladming	FLOHMARKT\n\nAm Sonntag, den 24. August 2025, findet wieder beim EUROGAST (überdacht) in Schladming ein Antik- und Trödelmarkt statt. Von 08:00 bis 13:00 Uhr erwartet euch eine bunte Mischung aus Antiquitäten, Raritäten und allerlei Trödel.\n\n\n	Eurogast Schladming	2025-08-20 08:54:39.215	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRXNBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNnUUFRRUJBQUlCQXdRQ0F3RUJBUUFBQUFBQkVTRXhRVkZoY1FJU2daR2g4TEhCOGVFaTBmL0VBQmNCQVFFQkFRQUFBQUFBQUFBQUFBQUFBQUFCQWdQL3hBQWFFUUVCQVFBREFRQUFBQUFBQUFBQUFBQUFFUUVoTVVGaC85b0FEQU1CQUFJUkF4RUFQd0NLQ0NHcWdLSkZBQUFFQUFBQUFVUUJSQUFFQlFBVVpVRkVBRlJRQUFFQUFBQUFBQUFEQVBCT3lDaXF6R2dRMFJCUUFBQVFNQVVFQlFBQUFSUkFBVFFVUlFCQUJVQUFBVUVBVUFBQUFBQUFBQUVBQURRRlpVQUdwUFZRZ3FBZEttZ0tnSUFBQUFDS0FndUlBYUFLckpvS2ltZkNqSTE5dDlqN2I3QXlOWlRQWUdSY01CQlJCREZBQVVFQXdBWEFFQkFBQUFBRVVVUVdSUVJVYWdHS2dCcUFBVUFBUUZWbFVGRVVDY2dxaUdDb01qU1lDTGl3ejlnZ2NpalF6dkNib05qS2dxR3BvS2V5YW1nMWlOU3FEbTB2QmtCazMzYXd3R2RMVnhNQk5SckV3RUZtS0RJcUFMRVVGUVdUQVNRYUFRVkFUQlFFQUJGRkJoVndCRlhFNkJkaWFweFVBUmRBQkFhRVdkZ0M0aWhtK1UrMnRLREdMMzVNaWZBR0dLYUFLblBnRkU1OHFBQUlLZ0NpQUJaS0FKOXM5RDdWQldmdE1hQVp4TWJRR2NHMHpRU05KK0RRS2djZ2hOVlFRRS8rZ1ZPZlJkdm1HZ0kxV1FWbTlyaGdJcUFLZ3FBQW9vaXdHaE9LZkdncUN3RVB3dDRpZGdxZjNwS3NBVDdvdndueURReCtXdGtCUmkzYTFQa0ZGVEFBd0JKZTU2QjFmbi9SOVhFNEFMZWo2YjZyM2ZnQVdrVDBRd3RrSmQ2VkZ3RTNuUFFWVEFFVERGQlV3eFFFd3hRRXd4UUV3eFFFRkFZUlZCa1VBVkZCTUZBUmRSUU5CQUx3a3FmSnN3R3J6RWxKMzJ2SFZCTjVYVnlNOGRBZjVMUE9yM2Y1VzlVR1V5OXcxdWRDNm0vVjZLcUNLSnVnQ1hWckY3Qlp1eHVNU3RnVldiL3RPZjdRWDZ1aVh0UGsySUxmcThSWk1udjVTVEZWRlRRQlJBRFFBVVJRQUFBQUFBWlJRVkZBQUFCRnFBS0FJS0F4Wkl5MWUwQnY2Y3hML2ZCMG1nY2tOUUk2VEdmcXU1KzB3ODRCamM2aVh1b0RiUDFldm9iWWFDU3RSemErbWhHM090czc3QWpvNStYUUU5UGtQVDhxRG45WGFOMHoyU2pTRlp0dlB3bzByTTZhQUFBQkJGRUFVQUFSUUFBVGs1QVZGRFBRQUZCS2pXQUlhbnhwZ3BwaDhNN1JGK3J3a1AzK3lndmhPQkJjeFlqWGhKeUozcU41ekt2MnhqcEJiNms5MVJSZTBKeHdYWjhBbjIxY3NKVnREbE5xYUx3TDJuWFRlK1dmSzlpYWM5cnFBaTFMZUVTa1ZxMk1rN1hBdUxPbDFKU1pBVVRRRkJBRkU4Z29nQ2lBalFnS0t5TEdhME02MmpWVDhDZ00va3ZzcUFrOUZaVFZUYTBjTTZhSm1jdGRNMDBxTitJcUdpSEowQU4vbXBucWtxNktZMW5ETys2Zmo4Z3BwN2s1RTdQNzgvOEFEL1BvdG5vbjhnbDRUVzlsWnM4K0FYdUdWbWEzeXFicWRlVTUzaFdwbUp2Q3BnSEZWbkxTenluYXd0a1piVE02WFR3aTR6cXBVNUZNV0w0WTVhM2hGM1ZaOG1ySjVWRkFSUUFCVUFRUENyVWl5ZVduUHp3MXFGalFrVVVUbFFHYjdweDZmdHJBVm5QcEp4MDF5Q0pzOW1iRzhadjAzMUJpZHIzV3Z0VE01Qm05ckphamVvTTRuVFZyT3FMR3RqRW10WmdKU0xaV2N1ZzN2REpsOHJJS2hxNXEvYjdwVVowMnRmYktsbUxSZHY4QVlrdUorLzhBSnhmSVkzeFU2OC93a252UDJsM25FVnE1NVlhK24xcTRVWWk2Y2VwVlJmdVM0bSt3RUZURndGa2JabHlMb0tKOTBUN3ZhZ3VDYmZUK1RuMC9rRnd3MitpZzVjcm5xdlF1WWxWV1oyM0JJS2lvMEFBQW1nb3p2dGYwZmQ3WCtBVkxjUHU5djVqRjVBMDFNYm5zQ1pxZmJXMHZDVll3Y0xPMnZ0VkdJdXBtWERrR3BWNlpuYS9VZ1d5bjA1ZGpLeFZYNlcyUExUT2k4R1RNUTBJejl0blNTK3V0L0ZYaXJSekdySi9EQ28xRjF6YWsycEZyVnp6L0FBaldSTE02QmxjalY2WUtpNFo3b2FvMXdjTWdOYWF5QTFwcklEV21zZ0NyOXJXUmFrWmthVVJRUm0zZUlDNzZjcno4SnhEc0xEajNwMkpWak52eExEajBXS0ZZNFc0MWtUN1l5MHdhM2tNaXBVbHRhN25LTkp1TG1zU2JkOE5ZdlNkcUpmcDhweDZ0TTJBdXllQzRuQmVrVk9GWldLTlRxb2JhbGw4b2ROREs2UlZUVFRzZ25OVEsxbm9sVkdXb2dJM3FmY3ppNGtVM1VheGNWR09SMDlVNG9NSTNrV1RBY3gwNDlJWkwvd0NBNWpWK24wNVRQWUVWQUhjUlFFQUdiZTgrSi90SnM1OU9JMGxpS1c0U3A4cTB4cWlDb29pYWhHcDUrVlpOakhycDRDYjZMSjZ0c3dhSmtJaWlLQWlWcG02REpweVpSZFRWaVdZSVkwcktpOExrL3dDTTVWWDhpUmhXdmtVZ0ttSXJOaEcwRTNFYWlLcUFBSGdGQkJEUVVBQVVnSmd1RUFVUUJVQUVFQXJLZ0pxY3JpNERJMWkvYURPTEkxMG9KSW9BQWNnQ2NxQ0grRlFCTGhhZm9Fck9ObDlnWTFVc1FXdGpPbW90YUUwQm8xazBHaE5QOWlhMUFGUVZQS2dJcUFnY29DcWlnS1JRUkZRR2hPRFFPRVVCRHlvRE9mQzRvQ0NweUMvZ0ZCT3pvNTBBN0RZQVljSnFBdW0wQVhsTktmcjlBaXlIUHdzQk0vOEFTeVNMYm5nMzJCaXBqWHY2cjJEbmd0aVVFRlFCWWpVb0xPV2tubFFBQUFJQ29BQ2VRQVZEY0JvK1UrT2dGUlFGUU1BVkFBRjRCQVFGVFUrY1VEVlNSZEJBL3Y4QTBBMFRsUUJMTldkQUM4ZXFBSHVBRlZBQVBoUVE0L0lBaVkwZ000djIzKzFlRjNQY0hQTVdSdnVuUUdBQUhrUUYvd0QwUlFRWDRBUUFCUk9nYVRvUGdCVVVBMU5RR2hBRHlxR2dxSW9Kei8xUlpBVFJlT1Q4ZmtFK09FV3hKTDhnWlZBQlVBRG9BQlVBREZvTTlHNm1hdjhBSUtDZ2hvQUl1cmdJTGlBQUFJcDZBbjdJcWdZZkM2ZklNK3Z3WUg1NkFMMS9lLzc0VlA4QW9MVERsSi9lQVVBR1ZSb0V4VUFWQUFtYVV2aGIwQkM4L3dDa1FGSlVpZ0hJQXFBQUlvQUFCMmkwRlJKeXZrQ1Mrb1VBVUFFQ2dkS2lnSXFBQUFLbDZRRkRRRlFBRFVBWFJGQmRRQUQ4S2dQLzJRPT0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Antik-und-Troedelmarkt-in-Schladming_ev_25414130	market	f	t	\N	025, ttbacherleon2407@gmx.at, Web: gmx.at, 08.2025	2025-08-18 11:15:16.371342	2025-08-19 08:55:14.97248	all	1	12	f	\N	\N
71	schladming_ev_22669947	Schladming-Dachstein Nights | 8 for 80s	Im Sommer verwandelt sich der idyllische Hauptplatz in Irdning zu einer lebendigen Bühne für ein unvergessliches Open-Air-Konzert. An zwei Freitagen,&nbsp;können sich die Besucher bei den Schladming-Dachstein Nights auf einen bunten Mix aus Musik aus verschiedenen Genres freuen.\n\nFrüher bekannt als die „Sommernacht der IRDNINGER Wirte“, erwartet die Gäste auch diesmal ein unterhaltsamer Abend mit Live-Musik, köstlichem Essen und erfrischenden Getränken – alles unter freiem Himmel.\n\n\n\t25.07.2025 mit A.M.S - Die Band\n\t29.08.2025 mit 8&nbsp;for 80s \n\n\n8 for 80s\n\nDie 8 for 80s sind eine Pop-Rock-Formation aus dem Ausseerland,&nbsp;\ndie mit ikonischen Songs der 1980er Jahr- von Tina Turner über Journey, Queen, A-HA bis hin zu Cher, Madonna und Foreigner- begeistern.\nEinzigartig ist die breitgefächerte Besetzung mit mehrstimmigem Gesang, rockigen Gitarren, Synthesizern und sogar Saxophon!\nStilecht 80er Jahre eben. Das Repertoire ist extrem variantenreich und reißt von Jung bis Älter alle mit.&nbsp;\n\nWebsite:&nbsp;www.8for8s.at\n\n\n	Hauptplatz Irdning	2025-08-20 08:55:04.869	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2NiIgdmlld0JveD0iMCAwIDQwMCA1NjYiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBSTJBWkFEQVNJQUFoRUJBeEVCLzhRQUdBQUJBUUVCQVFBQUFBQUFBQUFBQUFBQUFBRUNBd1QveEFBc0VBRUJBUUFCQXdNQ0JRVUJBUUVBQUFBQUFSRXhBaUZCRWxGeFlZRXlRcEhSOEtHeHdlSHhJbEppLzhRQUZnRUJBUUVBQUFBQUFBQUFBQUFBQUFBQUFBRUMvOFFBR2hFQkFRRUJBUUVCQUFBQUFBQUFBQUFBQUFFUlFURWhZZi9hQUF3REFRQUNFUU1SQUQ4QTVnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQTZnSUFBQUFBQUFBQUFNOVhERGZWd3dzQUFBQUFBQUFBQUFBQVhrc3M1QkJaTjRMTE9RUUFBYTlONXhrQUFBWExadmhBQUFBQUFBQUFBQUFBZFFXSUlLZU8vdUNDMDhBZ3ZzQWcxK3g3QXlMKzVRWTZ1R0crcmhoWUFBQUFBQUFBRFhSbXN0ZE0yODREZHRsM21NU2VyZlp2cHR2YXo3ck03eWU5QmowNU5sOHRkVTNPK01aMVQzelcrdng4Z3plbjAyZks5ZmV4ZXJucCtUcW0yZmNHWjB5L203cE9tMjJlenBKbDdUdG5KUHpmSUpQdzNMdkxNNmRtNjEweXpwdjNPajhOQm4wZHRsUFQyMlhXdW44Tis1MC9oL1VFa3ZwNTdZazZkbTYxUHdmcVQ4SDZnemVudHN1bnA3YmJqVS9COXFUdjB6WnZ3RE42Yzc3OE1OOVZ2YnRrUFYvK1lEQXQ3MUFBQUFBQUFkUUVEVFU5ejZndW1vZTRMcHFIc0M2YW5sUDlnMW9rOHFEUFZ3dzMxY01LQUFBQUFBQUFBTlNiMjNBVGI3MDNHdlQzemUvd3paWnlCdDl6YjcxQUYyKzlOdnZTYzkydXFTWmdNN2ZlbTNuZTZBTHQ5NmJmZWttNzlFQmR2dlRiNzFHcjZmVDlRVGI3MDIrOVFCZHZ2WFQ4czlOeXVjbTNuR3IwNU41QmJmL0FEbTdYTnIwek4wdnB6dHlESUxNM3VDRGZWSk14Z0FXek95QUFBNmdJQUFBQUFBQUFBQU05WEREZlZ3d29BQUFvSUFBS0FqWFQrS010ZE5rdTBGNnZ4VDdOZFhqdHZmaExlbTNlL3hpZXJ2dmdHNXZtUkpKTnYxdWZZOVhUdTkrRW5WSmI3WHVDZXFXVDMxdnF1WjhzZjhBbnh2SzJ5NXoyb0wxU2IwNzkxdStKTFBabTNwdWZRbGs4MzQ5Z1hwNHYzVHA3N2JJVHFuZmZOSjFTZStBdmp2bW5WK0hmaG0rbnhxMnpNN2d0djhBNTNKNE9ydjB5L0NXeXpPNWJMTTdneE9aOHV1OTdLNXpON3JiTjJYdUMyWkw4eGVyOE0reVhxbG1Gc3N6dURWN1prN2VVNnIza21jeWx5WnRzK0V2VEpsM3lEVnVXZlZMMjZwOVV0bHN2ZnNYcWxzdnNCMVh2SjQvMjFaZTJabnQ3czI5Tjc5MWxrNDNQWUhPODN4OUVhdDI2Z05teGxERWIyR3hnTVZyMVE5VElZTmVwUFVTR0FlbzB4QVhUVVFGMUFBQUFWQUZzeW8xZWFnQUdBZ3VMMDh3RUZ5MjB6NG9HSTFKa3Zmd25wdmE2Q0RXWDlUTGI0RlpHcy80WUl5TldIVE80ckkxdC9rVEFRYnM3U2ZVeTdKYUl5TG5mdFRMUVFYUE9ucCtxaDZ0NWtxVzJyWmlZSWd1R0FpaWdncG9JWUtDWUFBQ2FLdW1vSUFIa0NvM09MR1FRVkFBQUFBYXZOUlVBVkZuN2lyaXlkeWNLR004Uy9ZbkYrWVdwdWNDTmZsK2FYaWZETzMzTjl3YTh5ZkMrYmZsTlFGbkZMeEUzMmFtZ1h4OEU4L0NYa0E3MHZnMm1ndDhRODFOTkFuSjQrNmFvSGo1THoraUFMZVVMUlVBQUFRQUVBV2NvczVBODBQZEFBd3dVYVpheEJmU1lzTHdweG1Gbm45VWpYMVJXRWFzL1JBQmNBUkdrRVZGdktBcXppc3RUaWlyT0ZKd29NMW1MVUVSUllBMW1vc29NMllxOVNBS0p5QUtBZ0FKeUtBaW9Bbk5XeUhGS3BmRWlvb2lBQUlxQXVXcml6ajRQSDNGWUFFWFVBQjBjM1NvdkF2Q3BlRk9NeFVqVE5hbmlmUmxwTDMrUkVRQUFSUnE4b3FDRFU0ckxVNEZhbkNwT0ZCaW8xV1JGQTRCV3BDY2Fvak43NGwyTlhsaXFIUExUTWFSVHNpZ0ROYVRBckt5bGw5bGsraW9TZGpGRVZQWmVVOHRLakhrSnlVRUFBUmNVQ2RsMzlFUUY1NFpXSUFBaWpwV0kySEZTOEtsNFVaalNSV0sxUEJHa0JtKzdMZkRLb2dvQ2F1MUVWR2xuSDZzeHFjQ3hxY0trNFVHZXBodnFKMGlKQzYxbUZBOFlxVkpxb3ZsS1RuN0xSV2U4V1NxYWdXSW9DSnVyVW5LcFNicm94MHhya0VQSmpOMkNxYkNXOEdCK3MreTFiRjdRUm5MVjlLVyt5QTNlMFpXOEpKdkZCYXkzSjdwUVNjYXl2MDhHQWcxa1N4Rkp5MzVqRTVqZm1CeHBtdE0zZ0VqU2RQQ29xS0lnckY3TnBRWUl1TXFJQXFLMU9QMVphbkFyVTRWSndvTTNscG04cjdLeXFvVzVpS3ozbHhWNVFHZUNYOVMvd0RVa3RVYStRekU4b0t2ZGNNRVk3clBxMWpOaWl6Q1ZuTDNia0FyTmF2djdJbld1RW5CYlpUZlk1VmxDOFFwZUloR0JSUnVwbnN2czBLeldXNnpnbHJOTnRLZ0FDS3M1amQ4TVRtTitZRjhhUzhLbDRCSncwek9Ha1VSUUdWS2lLVnpkUERDeEdWQlVHcHd5MU9CV3B3cVJRWnZKcDFNaU5hYnZMT21nMHVNYTNGRXM3d3ZndFgyQ3MzRHlWQkhWS2FkZ1ZucVhZemFDZUNYRW9pdDdjTWlHeFVJc1kxZEFxM2lKeVhoRlJVMWRWRGNWaHFDVm9TaW9sNVpXOG9qVUFFVlp6Ry9MRTViOGhmR21hMHoxQVRocG1jS2lxZ0FJQ0tsN00wb3NTb0FxRFVaYWdOUlVpaXNkVExYVXlJR0M2Q09rNGMvM2RQQ2pONWFuRERVNEVTOG90NVpCZFRWUUFCRkZpS0Fpb3FBQ0sxT1RaZXlUeXVJcVZGcUxFbzFFSXFOVVM4S3JMUGxGOG9qVUJCRmFuTGM1WW5MZms2WHhwbnE0YVo2dUFZYWxaYWt4RlVCRkVBVm4zUlVhWkFCQnFNckFiaXNyK2dIbm54L245amlaUHQrNjV4L1UzdjhTY2dmM1M5OC9iK3pYOVBoUDE1QVNwbmJtWDVuODdsemdHV3B3blpyWW96ZVVhN1ZNUVNDNFlxSWpTQUFJcUFBZ0tCRlNLS3JLaElscUxPUVZGdkJFT0JEeXl2bEVhQUFhbkxmbGljdEVMNDB6MUxyTnFwcWF2cVpHV210TmpJWWExc05aRERWdktBcUFBQ3hGQnBlN09yTyt3R3UwM3ovQUR1VFA1L2RPOG5mMzVOLzdzQlU1dk4rUGo5MTU5cy96OVA5cGJ5Qy93QlhPOHVsL3Y3OW5PODBCRzUrSDdyZWVyNEJpTkdTWjlsN2JpaUpXOGgyNy9BT2VxMWs3OWl6c0RLTjVQYmxMSkpmbkFaUlVRUllBQUFLQXFJS29BaTZJejVScnlpTklLQXM1WGU2ZGtCclVxSFlBRUJRQlFFQVZGZ2dBQW9nS3ZUdjhtbzEwNUFYUDUvbi9CbmJ4OGZ0OG0vWCsvdWJQcjhndkhIN0p4NTgrMkd6UDlmemcyZjkvdjhBY0YrUDU5bk84MXUyZC9ybjg0WXNBMnIzOStkL29UeDgvd0REOWdUdjcxWmJzMWZQMFN6ajdndHZibjZzNzFmVmM3ejRQdjdBYmZxYnpxL2Z4aDkvTS9vQnRadS9WcjcrYW0vWDJVWkZ1SWdBb0lBQXVvcW9hbXFsQkJSRkJZcXBySVZFVlZ4STBxV3BoaVdpTDlFQUdvMXNZREYxZXpJQUtnSW9BS0FBZHdBN2lnSW9LQXFBR2dCb0pRTk5RUVVScFJNTU5OQlVWQUFCRVVBQUFFQkZBQVZVMVZSbEZvaW8yeXNxcFdSVVJRQUJVQVZGUUFBSG9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCTGNCUmoxL1JaMVNnMEFBQUFBQUFBQUFKYmlUcTI0RFFsNFRwdG9OQUFBbHVUUVVTWFU5UU5BQUFBQUFBQUFBQUFETjZzdVkwQUFBQUFBQUFBQUFBQTU5WExvNTlYUDJCcVNZeGUxYjZlR0wzb05YcXMvUlBWZnNkWFAyYS9MOWdKZFQxVzNzelBQeFNidllHdlZaY3AxV3k5a3N2bXc2dkh3QjZxMTAzVm40ZnN4MDhnNkRIcHBKbTM2QW5WemlXWlRlK2x1ZzZXOXQrak10dWt2OEE1djBUcDgvQUhxcTlOdHZkT25sdXpZQ3M5WERQcHYwV3pPbjdnenVTL1ZycG5uOUdjN1crelhUZkg2QXQ2czdNNzFIVnpXcndCdXkxbjFVbkYrRHA1K3dIcXM1YXR2aG5xNSt6VzUwd0dmVldwZTIxbVM5VlhxNGdHOVY0V2RXOXF6TjhVa3U4d0Y5VjFQVlUvTjkzVUhLN3ZkcVcrZUU2dVc3eGZnR2ZWYndlcXk1V1p2aGJMNXNCMENBQUFBQUFBQUFDV2FvRG42YXM2YzViQWMrcm43SHByVjZkYUJtVEU5UHRXd0dQVDdyZW5XZ0V6dG4wWm5UWld3QkxObUtBek9uT1ZzVUJpZE5tL1dMT25OYUFZblRaV3dBU3paaWdNeVlsNmUvWnNCbTlPL0tlbSs3WURPWk1KMDQwQXpacVhwdmI0YkFZOU45MW5UMnNyUURIcHZpck9uTzdRREhwdTc5V3dCbTlPcE9teXRnTWVtK0tUcDkyd0FBQUFBQUFBQUFCbTNHbWVxNW5ZRmwyYXJPNUpVOVY5Z2JHSjFiMnJZTStxYmpUbDUrN1Y2c3VBMk1lcjZGNnM3UUdyY0pkWXQyTExrb05qSHEraE9yM0JiMVpXbU9xNWVJdDZzejZnME1lcSt5enEwR2hpOVhzZXErd05pUzdGQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFZNi9EYlBWTGNCbS9oalhUd2xseVJycG1RSFA4MzNkV1BUZDM2dGc1ZWZ1dlZ5dnB1L2N2VGJRYWtqbjUrN3F4ZW52c0JlcmhtZmhwNmJWeTVZQjBlVTZ1V3VtV2FsNmJhQ2RYajRoMWVQaGIwMi9vV1c0QzlQREhUekhTZHBqTTZiS0RNNSs3WFY0U3lXOXJDek9RYTZlUHUwejA4ZmRvQUFBQUFBQUFBRXRCVTJNMnBvTmVvOVRBRGZxUFV3QTZiRmN0YWxCc1NYVkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQmk5UG1IcHZtdGdKSmlnQUFBQUFBQUNVQzFpMHRRQUZ3RUZ3OXdRVUJCZFFGbGJsYzFsQjBFbmRRQUFBQUFBQVNnb3lzQlJuUDdxQ2pKK3dORFBzdmYrZ0tNNG9LSmY4QUFDak9MMy9vQ2pLd0ZBQUFBQUFBQUFBWnRhYzZDQ3lGQSt4M05OQSsvWkZBTU1FQlREdWR3Q21JRFVyYm5IUUFBQUFBQUJGUURUVERBTk5NTUEwaGdBYVlZQnZiVlREQURUREFOTk1NQTJCZ0NnQUFBQUFBQUFBbDRjNjZYaHpBWEVVRENIZE80S2Y3TXBnRk5NTUEzL0FRL3dCZ2FpKy95VUVkSnc1dW5Ud0NnQUFBQUFKVkFaOC96Zy8yMEFrVDc5bWdHZmJ2L1A4QWF4UUdhdC93b0NhbmxvQm45bFVBQUFBQUFBQUFBQUFBQUJMdzV1cm5RU05NZ0thdVNlNTc1QVRUVEZ6TEFUVHV0azBzaytRVEx1SjlHKzBzUzNMd0NXWWpmVnYyWUFkSnd4RzV3Q2dBQUFBQUpWUURmNThscGlnbW1tR0Fid2FZWUJwb1lCcHZKaWdtK1RUREFOTk1NQTAweUdBYWFZWUJwcGhnS0FBQUFBQXhZMmxnT1l0UUhTNzRTYzNXTm9EWDVTM3RGazdjZDJjb0xiTDM4cGU5N0dlOVhNcytvSmJ2amd0MXIvNllCZHFBRFViU1JRQUFBQUFBQVNnb21tZ29tMDJnb21tZ29tbTBGRTAyZ29tMzJOQlFBQUFBQUFBQUFBQUFBQUFac1lkV2JBWUZ4QWEvS2ZsWkFhbDdad1c4ZDlaQWEyYldSY0JHNUNSb0FBQUFBQUFBQktxVURmb2FhYUJwdjBOK2hvRzAwMDBEVFRUUVRhc3Bwb0tKcG9LSm9DZ0FBQUFBQUFBQUFBQUFBQW1hbnBhQWM4TWRBSFBESFFCakdzVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVMzRTlYMFN6a3dScllucStpZWt5aDlhbDFXTTgvVnNVQUFCaWNiMjQ1OGcyTTNlM2Z3bTgvWUd4amI3bjdnMHJGOC93QjE4NXZuL0FORE8rOTkxbkVCUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFTOXU3TzF0TDBpTWJUYXZwcXpwOXdKMzVhQVVBQVo3L0FObWdHZS84bkIzL0FKOEtkZ1R2L1pZQUtBQ1pxZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRC8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Schladming-Dachstein-Nights-8-for-80s_ev_22669947	general	f	t	\N	025, +43 664 2639371, 08.2025	2025-08-18 13:13:43.325492	2025-08-19 08:55:14.980782	all	1	12	f	\N	\N
72	schladming_ev_25413732	Dämmerschoppen mit Maibaumumschneiden der Trachtenmusikkapelle Donnersbach	Am Freitag, 29. August, lädt die Trachtenmusikkapelle Donnersbach um 18:30 Uhr zum stimmungsvollen Dämmerschoppen beim Gasthof Rüscher ein. Ein besonderes Highlight des Abends ist das traditionelle Maibaumumschneiden, begleitet von zünftiger Blasmusik und geselligem Beisammensein. Für das leibliche Wohl ist bestens gesorgt, und in gemütlicher Atmosphäre klingt der Sommerabend gemeinsam aus.\n\n\n\n&nbsp;\n	Gasthof Rüscher	2025-08-20 08:55:06.582	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2OSIgdmlld0JveD0iMCAwIDQwMCAyNjkiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRU5BWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNnUUFRRUFBUU1EQWdZREFRQUFBQUFBQUFBQkVRSXhRU0ZSNFhIUkVtR0JrYkh3TXFIQlF2L0VBQlVCQVFFQUFBQUFBQUFBQUFBQUFBQUFBQUFCLzhRQUZSRUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFBSC8yZ0FNQXdFQUFoRURFUUEvQU9hb0FvaWdBQUlvQ0NnSUtBZ3FBQUFBQXFBQXFBS0lvQUFBQUlLQWlnQUFBQUFBQ0FBQUFBQUFBQUFBQUFBQUFBQUtnQ2dBQUFBQUFBSW9DQ2dBQUFBQUFBQUFBQUtDQUFBQUFBZ0FBS0NDb0FBQUFBQUNnZ0tnb0lLQWlnQ29BRUFBQUFCUVFBQUFBQUFBQUlvSVlVQUFGSXNoR3FDWVRDNU1vTTJZUnRoUUFCQVVSRlJRUUFBQUFBQUFGUlVCVVVCQlVBVVFGRUFVRUJSQUZFVUFBQUFCVUFBQUlxQUtnQUFBMUZ1MFRocmlBemhiMUtncGhLMWxtZ2dBaUFBS2lnQWdBQUFBQUFLaWdBQUNLQUFBZ29BQUFMMEFRQUFBQUFERFUwMG03b0t4OExHSFpqVndEQUFnS0FpaEVWYnNzdlJLemxSb3dtVElMc3lBZ0FBaWdJb0FJb0NBQUFBQUFxS0FnQUtJQW9nQ2dBTHZzY2VyVUErRlBoYkVWeUc5VENvQUFBc0ZXWldTbWxxNTRCS3pibHVmTm5VREFBQ29DQ28xT3NCRWFySUxESFhDNmV5N1dVREVuellyZHZSZ0JxYWNtbWN0Z3o4TVpzYlFHQmJFQUFCQUFGUUFBQlFBQUFBQUVVQkZGbTRGNGk0THZQbzBLa25Vc005VmlDTU9sWXN3b2d0UVFYaEZSWXVuZGV2ZG1ONVVKbmxuVlZ0akFBQUFpaUN4TUtDbUpqZnFXNVRUTTBGa3NyWFNicmNUcTVXNUF0eVNabzFwM0JzQUJLcVVHYXkyd0FBQ0NvQXFLQ0FBb0FOWVp3MEF5TGhBQUFDQURXcFoxaTJaakVGVlltVnprQzFNNXFVbTRoVUtBc1ZDb3BGM1RUdTZLTVdZakxlcXNBQW9DS2dnb2lLcmVtWWpuTjQzcXZIM1ZHZFZ6NklBQ3k0cUFOOHhXTXR3RlJVQkdMdTZNVUVBQVJVQUJRUUFCcUkxQU42SUF2c0l2Z0djRFNXQWl4R3RnYXp4OG1KbFp6NkxwNmdZeXpiMmF2WkJUVE05YVdZNnBMajBXM0lqS2tuS2lvVWF3Z2s5RzhDcU1hc2NNbElEUllDb3dOVmxBQUFBQUFBQUFhMDNveTNwZ0tDQU0zWlVvSUFBaW9BcUFBQUsxSjB0N010N1NUdjFCa2RNVHN6WmdHZllWQUY4SUFTZFo2dDJNbWVnRzJmbTNKaHptN3FDV01hcTFxdkRtQUFEY0x1bVNBc2pXek11T0V0eURYeEpsQlJLUlVpRFFrVlFZYll1NkFBQUFBQUFEVTA5d1NUUG8yRkJuTkZRRUtaWkFWRkFBQkZSUVFBRmIxYitrVFR2QzcwRE9FeitDZ0dRT240QUFBQUFkTTlNL0p6UGtCVUZtOEJxUmJJZTVuY1ZnTHVDQ0tLQ29RRkFBNVZBQkx1cVZCQlVBQW5VQmNLQVNZWEtaVElONWpPV1Z0QVRJZ0tJQUtpZ0FBQ0FBQU42ZWIyaUxQNDM2SUFBQ0xkb251dkFCNFBDQXZrYXNaQUVBVkZBTW1VQUZUaFZBQUFnQXFBQzloT0ZBU3FsUUVBQlovcUxQOUJVNTlEdWdHNEFDS2dBQUtpZ0lvQUFBQUFnQU4vOHoxUmJ3Z0NkMVFBRndDTE41NnJoWnVDM2htN3RNM2NFOG92aEFGUUJVQUZWS3FpQUFIQUFBQWNMRVVCbXRNMUFBQUFCZTZIQzBFNEZRRUFBQUJVQUZFVUFBQkZBUUFHcWkxQUFBR3B0NjRUM0lDL1VtOElzM0JXYnVXOVdRWDkvdE82K1U1QUFBSUxBTHVxWGRWRUFBRVVBQUJVVUVTcWxRQUFBQU1ndWZrQ0JVQUFBQUFBQlFBRVZBVUFFQUJhQUFBQ2tBRHFzNVNVQXUvMlR5dU9RQk8zMER0KzhnZVBZWHorVUFXRVdnenlxS29BQWlvb0FBQ29BQUlJQUNBQU5NcUFBQ0FBQUFxQUNnQUlxQW9BSUFDZ0FBQXZzbmNBVVFCWndJQXRML3RSZkg0QS9mdkUvZjZYeDdFOWdXRlZDREtvcWdDQUtnZ0tpZ0kweUFxS0NBQWdBRFRLZ0FBZ0FBQUFBQ29vQ0tnQ29vSUFDZ0FnQUtBQUI0QUFBUDMrdzhnZnYyclVTZTdRRlpXN29DS2dvQUlBQUNvQXFBQUFBaW9BQUFxS0Fpb0FBQUFBQUFxS0Fpb0FxS0Fpb0QvL1oiIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Daemmerschoppen-mit-Maibaumumschneiden-der-Trachtenmusikkapelle-Donnersbach_ev_25413732	music	f	t	\N	025, Ilsingerluidold.siegfried@aon.at, ilsingerluidold.siegfried@aon.at, 08.2025	2025-08-18 13:13:43.326924	2025-08-19 08:55:14.981683	all	1	12	f	\N	\N
73	schladming_ev_24675156	Paganin Soatnquartett präsentiert IM TANZSALON	PAGANIN SOATNQUARTETT präsentiert IM TANZSALON\n29. August um 19:30 Uhr\n\nMit IM TANZSALON begibt sich das Paganin Soatnquartett auf eine Reise in die frühe Swing- und Schlagerwelt Europas und gräbt längst vergessene Perlen der deutschsprachigen Jazzmusik des frühen 20. Jahrhunderts aus.\nDas wilde Berlin der Zwischenkriegszeit und die österreichischen Operetten dienen hier als Inspiration um diesem nach wie vor einzigartigen Liedgut neues Leben einzuhauchen und in die Jetztzeit zu holen.\n\nIn typischer akustischer Hot Club Besetzung á la Django Reinhardt strahlen die schönsten Schlagermelodien in neuem Gewand.\n\n&nbsp;\n\nEinlass: 18:30 Uhr\nBeginn: 19:30 Uhr\n\nVVK: 18,- EUR\nAK: 20,- EUR\n\nReservierung unter kino@dirninger.com oder per WhatsApp oder SMS an 0664 637 90 05\n\nAlkoholische und antialkoholische Getränke und frisches Popcorn gibt es wie immer vor Ort.\n\n&nbsp;\n\n\n	Kino Gröbming	2025-08-20 08:55:08.504	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBR1FBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNZUUFRRUJBQUlDQVFRQ0FnTUFBQUFBQUFBQkVTRXhRVkVDWVhHQndSS2hrZkFpc2RIL3hBQVZBUUVCQUFBQUFBQUFBQUFBQUFBQUFBQUFBZi9FQUJZUkFRRUJBQUFBQUFBQUFBQUFBQUFBQUFBQkVmL2FBQXdEQVFBQ0VRTVJBRDhBd0NnUVFCVlFCVlFCUUFSVUFWQUFBQUFBQUFWRkFBQUFBQUFBQkZBRVVBQ0FDaWFBbFJwUG9DSTBsQUVBQUFVQUZpcEc1MERrb29NcWlnaWdDb3FBS0FBQUFvQ0FBQUFBb0FBQUFBb0NLQUlLQWdvQ0tBQ0tsQkFVQmxhZ0JVV2dncUFBQW9BTEc1MHhHNTBEbUlvSXFLQ0tpZ0tnQ2lBS0pxNkFLQWdxQUFvQUFBQUFBQUtBQUFBQUNBb21vRFNVUUQycWUxQVp4b0JrcTFtZ29JQ2lBS0lvTEc1MHhHNTBEa0FBcUtBQUFBQVVLQ0FBcXNnTG9nQ3FpQTJNNmFEUW1nS0lvS0lBQUFDSUM2YWdBQUNpTEFWSUFLQ1VGWWExa0FBQUFCUUJZM09tSTNPZ2M2aW9BQ2dpZ0FBQUFDQW9DS0Fpb29BQUlzNVJZQUFBcUFLSUFxSW9BQUNDNEFMalh4bnNHRmhabFBZQ29RRkFCbEZxQUNvQUFDZ0FzYm5URWJuUU1BQWxJVUFDS0NBQUNBQUFLSUFBb0lBQzRBQUNBS2dDb0tDS0FBcVVFYWlSUlc0R0ZBWnZhOU03b2dRd2dLbFZBVEZ3WFVVekdhMnhaeXFDQUNpS0N4dWRNUnVkQXdJQWxBQlFBQ0FDVkZYQVFWQUZBQUFCRkFBQVFpZ0tXRTZMMEt5b0NDb0FBQUtpd0dvdFNMZWdacVFBUFpBQlU4cXpld1ZyMGl4RlZpOXQrR01WR1JVQlFBV054aU53R0VBRXFvQW9BQUFJcUtDcFJBQVVBRUJmSVR5Z0tJQW9pd0dvVVNpb0lDS3FBQUFDNXdqVUJaMDB6aGFCWXpqU0FpZ0F5dTR6b05ScGlOWlJXcGVFcWZUMGFJbUppNnVneUxaNVFGYmpFYmdPWUlBQUFxQUFnQ3hyaG1OQWRNclFFRVVBRkE4QitrQlJBQll5c0JyVUtnTkRMUUFKUUFBV1RXc3hQamNMZEJyd3hWdFFGUUFQS1dpWHNFQUJxTlRxMWlOZVB5Q2J5SUF0NGhDb0RwNFlhOE1nc2JqRWJnT1FvQ0NnSWlvQUFBb0FDQUFBS3VvczdCYWhZZ0FBSW9BQXNtMEZrNDBidlRDS2hWUlVBQUZRQlVWQVZGUUVSVUFBQlZxQUlzUlFCQUd1K0M5cjhTOWdSdU1SdUE1Z0FBbEJBQUZBQ2RyU0pRUUFBQUZCQWEvSy93Q0dRRkVBQlVBZFpNakU5dGdybTZPYUtWRnFBSXFLaWdBQUFGQUVSVUFCUVJRQkJUQVJjSXYxbjllQUp4eWVhZmJ2K2dHbzFHSTNBYzlCQVZGS0RJQUFLQzRMRi8zQlhNV29JQUFxS2dLQUFLU2FBc210V2NKT3hUS3ZMUWdrM3lsN2FZdDVCQ0JBRXFpaUM5SUlxS2dBSUFCWllBdVVqZWd6L0drK1B0MDFLRFBFWjVwZTAwRjQ5SDJSYzQwQ0FBMUdvekdvRG1LbEFBQVJTZ2lBQzZ1NnlvQ0tnQ29vSUFDckVXQXY0YmpNWFVYR21aM0YxbTNvR2xPMmR4VUxXU3BpS3BFVlFWRi9hQ1ZGUlFSUVFSVUFkTDFJeEc2REhWYVl2YXowRFhlc05XLzlNZ0FRQ1J2T0w5a2FCZ0FGamNZamNvTUlBQUFDVlVCQUFGUlFFVkFGQUVBQlZpTlNjUUlhYVpUS2ltcC80dVZGSFNYaExHWldxZ25DVVFCWWdxTDVFYTVCQUFFVVJVRlJVSTBpQWhBZ0w3UXY2UUZhWmpRQ29vSmUwV29DeFRBR1FBUVVCQlVCQUFGUlFRQUZBQkJRQnJiT05qSURYOHI3WCtWOS93Qk1LSzEvSysvNlpRRUYxQUYxQUJWQUViWmFCa1ZBQklxS0lvcUFBTTBpMUFLaTFBRlJRWFBxWmlsNkJBVUEwQVFBQUFCQUFBQUFnQUFDb29JQUJPMnNTZHo3dW1Dc1lqZFRBWlJhZ2dBQUJBYUFBYVphQkVWQVJVVUFBRlFBU290SUNYOUl0L1NBS0FORjZJVUVBQlFRQVJRRUFBQUFBQUFBQUJkK2lBTHM5SUFEcGZsSE5ZQy9oUHd1eE9BRVZLQUFBc1JZQ2dvSXFBS3lvQ0tpZ0tTY1dnQ0tnQ0tnSmYwaTN4OWdDa1dwQWFLck43QUFCVUFFQUFBQUFBQUFBQUFBQUJGUUJRQVVBRlNxbEFpTEVBV0lzQlZ5a2FSV2NScW9ES21WZVZSbFVXUUc3MHl0NjVRQkFBUlVSUytQc2s3V3BPMVJma2kxQVdWRVVGQUFBQkFBQUFBQUFBQVFGQUFBQkFVRVdJc0FVVkZROWkrL3Nva1JZZ2dzUllEVWFZbmJWUlNvbW1nMk1TdFhvR0cvaXkzOGVsUlBreXQ3UUFBVVJXVUdvdjRuK0dkVUdzbG05T2JWdmhsVVJVQVZVVUFBRUFBQUFBQUFBQUFBQUFBQUFXZG9zQnJERFUxRlhFc3pmc2FuaS9nQktvcUlzUnFjZzFKNVVFVk1NVUJNVUFac2JuVVpyVjZWR0VFQVZGUlF3VUdjVUFadll0UlVRQUZWRkFBQkFBQUFBQUFBQUFBQUFBQUFGblNPbXlUaWd6bE05bTFFVnIvaXpSRlFGZ0NOL0h5dzZmRUZPUlVWbm42SFAwVUJPZm9vQUpieEZab0lpZ0lLZ0M4b29BcGdJeTB6UVFVVkFBRkVVRUFBQUFBQUFBQUFBQUFCUUFGcUtDQVlDRFg4VEFRWERBUlpjUlFiVmlYR3RSUkp5dXhKbnNHa05ob0JlV05xd0FWQVJLMGdJYUlvcHFBS2xWQkVBQlFBVkFCUnJQcVpQZjhBUU1renkxWlBESU55ejFqUHk3NEpwZEJrVUJCY0FRVUFGTUJGWEZ4QmxjWEo3YTRVWXdiNFRJRFBLNzlGeUprUlRUVnlHUUUwWGhlUDlvTUdOOEhBTURmQndEQTN3Y0F5Tkppb3lOWXlpb0tnSUtpaUNvSUFBZ3FBb0FBQU5qV0dBeU5ZWURJQUlHTGdJS0FpaW9JcTRZQ0M0WUFMaGdNaTRZQ0M0WUNDNFlLZ29BR0FBQUFBQUtJaUtZRElvS3lLQWdBSUtpb0lvQ0NvQUFEc0FBemF0cklBQ0tJb0FBQXFOUUZBVkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFcU5Nb3FBQWdBQUFDQUFBcUFBUC8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Paganin-Soatnquartett-praesentiert-IM-TANZSALON_ev_24675156	general	f	t	\N	0664 637, 0 05, kino@dirninger.com, +43 664 637 90 05	2025-08-18 13:13:43.328471	2025-08-19 08:55:14.982675	all	1	12	f	\N	\N
74	schladming_ev_22956530	Platzkonzert der Stadtkapelle Schladming	Platzkonzert der Stadtkapelle Schladming beim Pavillon am Schladminger Hauptplatz.\n\nDie Platzkonzerte der Stadtkapelle&nbsp;Schladming sind ein musikalisches Highlight des Sommers, das jeden Freitag stattfindet. Diese stimmungsvollen Konzerte laden Einheimische und Besucher gleichermaßen dazu ein, die warme Jahreszeit mit traditioneller Blasmusik zu genießen. Vor der malerischen Kulisse des Ennstals präsentiert die Stadtkapelle&nbsp;ein abwechslungsreiches Repertoire, das von klassischen Märschen bis hin zu modernen Stücken reicht. Die Konzerte bieten eine wunderbare Gelegenheit, die Kultur und Gemeinschaft von Schladming zu erleben und sich von der Musik verzaubern zu lassen.\n\n&nbsp;\n	Pavillon - Hauptplatz Schladming	2025-08-20 08:55:10.524	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRXNBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNvUUFRRUFBZ0lCQkFNQUFRUURBUUFBQUFBQkVURUNRU0VTVVhHQlFtR1JvYkhCMGVFaU12RHgvOFFBRmdFQkFRRUFBQUFBQUFBQUFBQUFBQUFBQUFFQy84UUFGeEVCQVFFQkFBQUFBQUFBQUFBQUFBQUFBQkVCSWYvYUFBd0RBUUFDRVFNUkFEOEF5QUlBQUFBb0FBbVNTMFVhbkgzV1NScEFBQUFBQUJBQUFBQUFBQldMdWlLcklBQUFDQ29BQUFBQXN1RUFkSmNxNU9rdVVWUUFBQUFBQUFjZ0ZRQUFWQUZRa3RkSkpCV1p4OTJ3UUFBQUFSUUFCQVZBQUFBQUFTNlZPV2hXUUZaQUFBQUFBUUFBQUFBQUFHNWN0T1RjcUswQUFBQUNaQmpHVEN6UjBESXQ2VENpTnpqN2s5TStXc3ozUVVBQUFBQUFBQUFCRlFBQUFBQUFVWjVMV1JBQlVBQUFBQUFRQUFBQUFBQUFBR3BXbk5aYjdvcmVaRXpmKzZrK1B1cUNmNS8wRkFUcW5SMGZpQ1hwTHRmWTd2eW9GSnNxQ3lFdDl5YWpNMkRlYkZ6K21lUk5BMW1LNXpaUWRCalBnbEJzWjlYNk1nMGhtR1FBQUFBQUFaNU1yZG9xQ29Bb2lnQUFJczhwUElBdmEyQkdScWFTQ3hGd1hhM1FKSmt4NVhqcE8vc0N6Q3pSeTBUU0RNYWpNMjFBVlJBVkV5QVRWUHhKcW40Z2RUNlM5L0szVVN6SDhBbTZjamp1bkxvRm1tWnY3YW1tWnY3QnJsbzQ2T1dqam9FN1hrbmYydkxvRHI2UmVrRkM3L2dYZjhFV25SeU9nVHBacWswVFZCSVRzaE8xRHJJVFJOVkJDSGE5cUUyZG5hOWduZjhBQ25aeUF2Uy9qOUY2T2tEaWsydkhTY2RxRjMvRnVrdS80dkxYMkJOSnhXYWljZG9GMy9GdWt1LzQxeTBDY2RKMzlyeDBuZjJDMy9jbis1Yi9BS2tCbnY3YW5tSHBJb3FBZ2lnS2RVL0ZVVkQ4WW5McGZ4VGwxOElISFp5Nkp2Nk9YU2l6VFBmMjFOTTkvYURYTFJ4TG80OWduZjJjdWp2N1dxSjBUeXMwbkZBbS93Q2wzL0NiL3BkZ3ZJNitqa2ZqOUFrMVZuYVRWT1BhaHg3SjJjZXlkZ1RSTlZlT2lhcUNUYytGL0pQYjRNL1NoTnIrU1pxWi9ZTmZrWGJLZ3Q2THJId2dDeTRpVHdBRzZ0dVVBQUFGUmZJSXVGd29KZ1hDZ21FNHRNOGI0QnJHV0sxNVpSY0RvVUJQZjRWUGRVUHhUbDB2NHBla0NiK2psMFRjKzE1YUE0Nlp1L3RyanBtN0J0Y3hCUmN4Sit5VFBuK0xnRThIajJYQUNlUFk4SW9HSlRIZ0FTUlpNQ2d6Smd4akxTQW5Ic25aeDdPUFlFODQrR3ZUR1oxOFZzR2J4WXhYVkFjeGJ0QVVRQlJGQUFBTUxOdFlCTUtvQ0NvQ3BsQkJmdE9Ja0JxMU9rVVZscEZBT2dWRS9GT1hTOWZhWFVBbTU4MWVXa20vdGVXa0RqMnpkcng3T1d3YU4zOWY2bTFVQVMwVlJNeWdLaW9JQ1c0U2N2Y0dnVUVGQVptNlRkTTR0U1h5Q3pjKzIySnVmTmJBUTkvb0JpN1JidEFCUUFSUUFBYTR0TVRiWUFJQ29BQVlFQm1kdHNUVkFWRm9xZHFkb0NuUWRLaWZpWFVQeFMvaUIzOXhicE8vNDFkVkJuajJYWkNnMU5LazFGVUdHNnhSUnBtTkFDcDhpSlVNeStJZ3JvSjZwLzhBcWlBQU1kLzFDM3o0QWFuWHkyeE92bHJRSGQrZzdBWXUwVythc21BU3JpMktDczRzUnRtK0JFVktnTlM0cmNzcmxsQWR4amplbXdCRkFSVVJWWm5iVE03RVJhaFJWUlVCUVA4QXRVVHFuTFVXYUxvR2ExZE0zcGVyOElFMm5MbzQ3WGwwb3N1SXo2Nmx2aVJrR3MweW1EQU5UbGpwcVdWenhVQjJ2aU9WdVZ0dHd5QXFMbjlBamM1ZFhUTzF2SEFPakhLOU5UVWM3NW9JdVVBYWw4NWRNWmMrdmgwbDhBQUFrOEt6YmlrMENnaUtITDNDNnFveFR4K3pGUUY4SUFOY2R4MWNaSFVBR2Mvc0cwWjlSbEJ0bWQvU1ovZEoyQVhZZGlxbmFwMkNnS2hDL3dEcmY0WTgzNE9xQ1ZycG5lRmxRWm0xNWRHUE8xNWFCbkdaL1djTnpUS2lZTUdUSU5aU3p0bHFlUVNSYlBEVm5pTTlBeUFBM2JuRERRdU45T2JUTlEzRVVGUWpweDBuSC9aWjM4Z29XeGtDenpvbWhMYUNvWlRJTlpLeHRzRXJEZFFXTWlnUnIyK0cyTjQvallpVzRqTFZ4cE14QkEvOFR4K3dDZG1DZHFLQ29vbmFwMkNqRXRhelZJMUVsODM3WnlJUnZJeDVNaEZSWXVBVExGN2J4R0xGUkJVQWRPT3NzTlRsandEV3ZobkMrcjRUT1lES0tDaXpDQU5lRXFBZ0FDNXd1ZjB5QTE2djEvazlYNi95eUExNnYwbHVVVUFBRGo0dmx2TVlBV29BdEVVQ3RTZVkwenhhRVl1eWVjclo1cWFCTUxOR1ltVUd1a25hWkZHb0JVVlU3UEtDZFpXVmx1UlZ3QVJSRkpBYW1oRVZrdDBoUVhCQVJRQlUwVkZFQkFGWFVZWE45d0F6VjlWL1g4QmZUVXd2cXA2azZHREJtZHRaNGlzNE1MZVU2OHBzUWtpMjQwU0dQQ2pBWUFVUUJVQUFBRmJsOTNOWUNsOGdnWUJaajk3QkR0cng3WCtzOXFMQlVSUkZRRWthWWxzYnpsUUlKVUZUL2xsVlJyS1paOGdMYWk0cUM0QUFBQUhrTWlHS1lxNVhNQm5GUjBQRkJ6R3NHQVpGUUFBQUFGTTMzUUJjbVVBYXorbHpQWmhRWHdnQUFBTlNJMkNZVERTQW1GQUJPMVRzRkFSUVZBYzJrVlNMaExGaTN6QkdRQVZxUWsvcWd6eTB3NldaY3hRYjR5V1padTZDQWdpZ0FnQUFBS1pRQlJBRkVBWElnQUFBQUFBQUFDaUxnQnVhWWJtZ1VRQUFBQUJQS2dDeEFtMFZrQVVtMjNOdnFLbXBVbmxyYlBtQ09tUGVtWkhQSURkNU9hb0NvQUZ3Q0FvQUNLQWdvQ0FBQUFBQUFBQUFBQUFvSmdYTlFGQUFibW1HcG9GQUFBQUFBQUFBQmxIVEVaOUl0WmFpZW1rMkM1d2x1V3I1VDAzdng4aU1qWGllOS93bWZieC85N2dncUFBQWlnQUxqM3ZuOWVXUVVRQlFBQUFRQUFBQUFBQUFGQkJvQkVhU2dpZ0EydzJBQUFBQUFBQUFBQzRGQVFVQlBDV1o3YUFZeFVkRUJ6Ry9URm5HZGd3WXJWdU5USDcyemJuWUhqNU0vVVJRUEgvMy9BSUFpZ0NLZ0tnQUFBQUFBQUFBS2dEV2YwWlpBYm1NZVdUQ2dtQ3hTZ2pUTFFLSW9BQUFBQUFBQU5BQUFBQUFBQUFBbVR4MnVFQlBURTlOYWhvR01YMlIxVEVCekc3SkdBRVZBVUFFRkFRVUJCUUFrdDBMTFpvRXhnYTVUVElDZ0FBQUFBcVJRQUFVQUFSUUFBQUFmLy9aIiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Platzkonzert-der-Stadtkapelle-Schladming_ev_22956530	music	f	t	\N	+43 664 15, 00 638, 638stadtkapelle@schladming-net.at, +43 664 15 00 638	2025-08-18 13:13:43.329696	2025-08-19 08:55:14.983952	all	1	12	f	\N	\N
42	schladming_ev_23573079	Dämmerschoppen mit der Trachtenmusikkapelle Pichl/Enns bei der Erlebniswelt in Rohrmoos	\N	\N	2025-08-20 00:00:00	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/07%20-%20Juli/image-thumb__2427966__teaser-row-sm/Pichl.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Daemmerschoppen-mit-der-Trachtenmusikkapelle-Pichl-Enns-bei-der-Erlebniswelt-in-Rohrmoos_ev_23573079	music	f	t	\N	\N	2025-08-14 11:16:44.114901	2025-08-19 11:24:18.994588	all	1	12	f	\N	\N
51	schladming_ev_19419770	Adidas Five Ten Latschensuche im Bikepark Schladming	Am&nbsp; Freitag, den 22. August 2025&nbsp;veranstalten wir eine ganz besondere "Schnitzelja..." äh. "Latschensuche" im Bikepark Schladming.\n\nDu hast die Chance,&nbsp;Adidas Five Ten Schuhe&nbsp;irgendwo im Bikepark zu finden. Dazu musst du nur die Stories auf dem Instagram-Account des Bikeparks Schladming verfolgen, die wir an diesem Tag posten, oder auf unsere Bildschirme bei der Seilbahn schauen. Dort findest du Hinweise auf die Vouchers, die im Bikepark versteckt sind.\n\nStart: 9:00 Uhr\n\nWer einen Voucher gefunden hat, sollte damit zum Infopoint im Planet Planai düsen und&nbsp;diesen abgeben. Dort werden eure Daten aufgenommen und der Schuh in der richtigen Größe bestellt.\n\nDiese beiden Schuhemodelle&nbsp;gibt's zu finden:\n\n\n\tMänner Freerider\n\tDamen Freerider Pro Canvas\n\t&nbsp;\n\n\nWichtiger Hinweis:&nbsp;Schaufeln und Spaten könnt ihr daheim lassen - die Vouchers werden knifflig versteckt sein, aber ihr müsst dazu nichts umgraben oder ausbuddeln.\n	Bikepark Schladming	2025-08-20 08:54:22.162	\N	https://www.schladming-dachstein.at/A-Z_Liste/Bergbahnen/Planai/Sommer/Berghighlights/Bikepark%20Schladming/image-thumb__2567399__masonry/Bild-Datei%20inkl%20Schuhe.png	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Adidas-Five-Ten-Latschensuche-im-Bikepark-Schladming_ev_19419770	general	f	t	\N	025, +43 3687 22042, 22042info@planai.at, 08.2025	2025-08-16 03:00:21.979864	2025-08-19 08:55:14.963075	all	1	12	f	\N	\N
44	schladming_ev_25262102	Dämmerschoppen in der Erlebniswelt Stocker	\N	\N	2025-08-20 00:00:00	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/06%20-%20Juni/image-thumb__2610240__teaser-row-sm/Musikkapelle%20Pichl.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Daemmerschoppen-in-der-Erlebniswelt-Stocker_ev_25262102	music	f	t	\N	\N	2025-08-14 11:16:44.116648	2025-08-19 11:24:19.000219	all	1	12	f	\N	\N
41	schladming_ev_14279800	Schuhplattlerabend in der Erlebniswelt Stocker	\N	\N	2025-08-20 00:00:00	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/08%20-%20August/image-thumb__1394577__teaser-row-sm/5046_Schuhplattler.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Schuhplattlerabend-in-der-Erlebniswelt-Stocker_ev_14279800	general	f	t	\N	\N	2025-08-14 11:16:44.112784	2025-08-19 11:24:19.003004	all	1	12	f	\N	\N
47	schladming_ev_22781213	The Magical Music of Harry Potter	\N	\N	2025-08-21 00:00:00	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/04%20-%20April/The%20music%20of%20Hans%20Zimmer-Harry%20Potter/image-thumb__2339403__teaser-row-sm/The%20Music%20of%20Harry%20Potter_2025_%C2%A9Sergey%20Shcherbak%20%286%29.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/The-Magical-Music-of-Harry-Potter_ev_22781213	general	f	t	\N	\N	2025-08-14 11:16:44.118548	2025-08-19 11:24:19.01199	all	1	12	f	\N	\N
\.


--
-- Data for Name: guest_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guest_sessions (id, guest_id, streaming_service_id, device_id, session_token, login_timestamp, logout_timestamp, auto_logout_scheduled, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guests (id, property_id, first_name, last_name, email, phone, guest_type, party_size, check_in_date, check_out_date, actual_check_in, actual_check_out, special_requests, is_active, created_at, updated_at, guest_labels, notes, language) FROM stdin;
7b44cc66-ddd1-400d-863a-52a42a1b8a12	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Hans	Mueller	hans.mueller@email.com	+43 664 9876543	family	4	2025-08-12 02:00:00+02	2025-08-15 02:00:00+02	\N	2025-08-15 02:00:00.109301+02	Late arrival expected	f	2025-08-13 13:33:28.351299+02	2025-08-15 02:00:00.109301+02	{family,outdoor}	Returning guest, prefers ground floor rooms	en
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.properties (id, name, address, wifi_ssid, wifi_password, welcome_message, house_rules, emergency_contact, checkout_instructions, created_at, updated_at, type) FROM stdin;
24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Hauser Kaibling Chalet #20					Check-in: 4:00 PM, Check-out: 11:00 AM, Quiet hours: 10:00 PM - 8:00 AM			2025-08-13 13:30:43.292252+02	2025-08-14 20:01:00.36014+02	chalet
\.


--
-- Data for Name: shop_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shop_products (id, property_id, name, description, short_description, price, original_price, currency, image_url, additional_images, category, availability, stock_count, is_featured, is_locally_made, is_sustainable, craftsperson_name, craftsperson_bio, vendor_id, materials, dimensions, weight, care_instructions, tags, sku, barcode, meta_title, meta_description, slug, rating_average, rating_count, is_active, is_archived, created_at, updated_at) FROM stdin;
a455457f-d90d-47ff-ae24-a56991cbb388	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Alpine Wool Throw Blanket	Luxurious hand-woven throw blanket made from 100% Austrian merino wool. Features traditional Alpine patterns passed down through generations.	Hand-woven merino wool blanket with Alpine patterns	189.90	229.90	EUR	https://picsum.photos/400/300?random=1	[]	textiles	in_stock	8	t	t	f	Maria Huber	\N	\N	["100% Merino Wool", "Natural Dyes"]	150cm x 200cm	1.2kg	Dry clean only or hand wash in cold water	["handwoven", "merino", "blanket", "traditional"]	\N	\N	\N	\N	alpine-wool-throw-blanket	0.00	0	t	f	2025-08-19 08:58:21.735215+02	2025-08-19 08:58:21.735215+02
940308a4-a2cc-4394-8878-faa241fb5ece	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Linen Table Runner - Mountain Meadow	Elegant table runner featuring embroidered Alpine wildflowers. Made from premium Belgian linen with Austrian craftsmanship.	Embroidered linen table runner with wildflower design	75.00	\N	EUR	https://picsum.photos/400/300?random=2	[]	textiles	in_stock	12	f	t	f	Anna Steiner	\N	\N	["Belgian Linen", "Cotton Thread"]	40cm x 180cm	300g	Machine wash cold, gentle cycle. Iron while damp.	["linen", "table", "embroidered", "dining"]	\N	\N	\N	\N	linen-table-runner-mountain-meadow	0.00	0	t	f	2025-08-19 08:58:21.767637+02	2025-08-19 08:58:21.767637+02
7a038ccc-6f51-450b-9708-5cd88edc0d75	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Hemp Cushion Covers - Set of 2	Sustainable cushion covers made from organic hemp fabric. Natural, breathable, and incredibly durable.	Organic hemp cushion covers, set of 2	55.00	65.00	EUR	https://picsum.photos/400/300?random=3	[]	textiles	in_stock	20	f	t	t	\N	\N	\N	["Organic Hemp", "Coconut Shell Buttons"]	45cm x 45cm each	200g per cover	Machine washable at 40°C	["hemp", "sustainable", "cushions", "organic"]	\N	\N	\N	\N	hemp-cushion-covers-set-of-2	0.00	0	t	f	2025-08-19 08:58:21.771316+02	2025-08-19 08:58:21.771316+02
854b99f0-1637-4565-8046-3591cb28c8ce	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Traditional Dirndl Apron	Authentic Austrian dirndl apron with delicate lace trim and traditional patterns. Perfect for special occasions.	Authentic dirndl apron with lace trim	89.00	\N	EUR	https://picsum.photos/400/300?random=4	[]	textiles	made_to_order	0	f	t	f	Greta Müller	\N	\N	["Cotton", "Lace", "Satin Ribbon"]	One size fits most	250g	Hand wash recommended	["dirndl", "traditional", "austrian", "apron"]	\N	\N	\N	\N	traditional-dirndl-apron	0.00	0	t	f	2025-08-19 08:58:21.772562+02	2025-08-19 08:58:21.772562+02
55fd5737-783e-4e2a-b0d1-d22ccafef9a0	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Felted Wool Slippers	Cozy house slippers made from felted Austrian wool. Non-slip sole perfect for chalet floors.	Felted wool house slippers with non-slip sole	45.00	\N	EUR	https://picsum.photos/400/300?random=5	[]	textiles	in_stock	15	f	t	f	\N	\N	\N	["Felted Wool", "Rubber Sole"]	Sizes 36-45 available	200g per pair	Spot clean only	["slippers", "wool", "felted", "comfort"]	\N	\N	\N	\N	felted-wool-slippers	0.00	0	t	f	2025-08-19 08:58:21.773905+02	2025-08-19 08:58:21.773905+02
e37f87e1-8896-4f41-8739-5f53ad12a0fc	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Mountain Peak Mug Set	Set of 4 handcrafted ceramic mugs featuring a mountain peak glaze design. Each mug is unique.	Set of 4 handcrafted mountain-themed mugs	95.00	\N	EUR	https://picsum.photos/400/300?random=6	[]	ceramics	in_stock	10	t	t	f	Klaus Wagner	\N	\N	["Stoneware Clay", "Lead-free Glazes"]	350ml capacity each	300g per mug	Dishwasher and microwave safe	["mugs", "ceramic", "handmade", "mountain"]	\N	\N	\N	\N	mountain-peak-mug-set	0.00	0	t	f	2025-08-19 08:58:21.775544+02	2025-08-19 08:58:21.775544+02
2f202196-abcd-4f47-92d4-333d74a99695	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Glazed Serving Bowl - Alpine Blue	Large serving bowl with stunning Alpine blue glaze. Perfect for salads or as a decorative centerpiece.	Large ceramic bowl with Alpine blue glaze	120.00	\N	EUR	https://picsum.photos/400/300?random=7	[]	ceramics	low_stock	3	f	t	f	Klaus Wagner	\N	\N	["Porcelain", "Natural Glazes"]	30cm diameter x 12cm height	1.5kg	Hand wash recommended for longevity	["bowl", "serving", "ceramic", "blue"]	\N	\N	\N	\N	glazed-serving-bowl-alpine-blue	0.00	0	t	f	2025-08-19 08:58:21.776766+02	2025-08-19 08:58:21.776766+02
275606db-6abb-41eb-b5b6-334979e4ee85	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Rustic Dinner Plate Set	Set of 6 rustic dinner plates with earthy tones inspired by Alpine minerals.	Set of 6 rustic ceramic dinner plates	145.00	175.00	EUR	https://picsum.photos/400/300?random=8	[]	ceramics	in_stock	8	f	t	f	\N	\N	\N	["Stoneware", "Mineral Glazes"]	27cm diameter each	500g per plate	Dishwasher safe	["plates", "dinnerware", "rustic", "ceramic"]	\N	\N	\N	\N	rustic-dinner-plate-set	0.00	0	t	f	2025-08-19 08:58:21.778217+02	2025-08-19 08:58:21.778217+02
288926b9-0bfe-4b6d-b702-2e4b328b8a5d	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Ceramic Vase - Wildflower	Elegant vase with hand-painted wildflower motifs. A beautiful addition to any Alpine home.	Hand-painted wildflower ceramic vase	85.00	\N	EUR	https://picsum.photos/400/300?random=9	[]	ceramics	in_stock	6	f	t	f	Elisabeth Hofer	\N	\N	["Porcelain", "Ceramic Paints"]	25cm height x 15cm diameter	800g	Hand wash only	["vase", "ceramic", "painted", "flowers"]	\N	\N	\N	\N	ceramic-vase-wildflower	0.00	0	t	f	2025-08-19 08:58:21.781334+02	2025-08-19 08:58:21.781334+02
bfc4f2ff-91ac-40a4-b42d-87f4cd2b5775	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Tea Light Holders - Mountain Silhouette	Set of 3 ceramic tea light holders with cut-out mountain silhouettes. Creates beautiful shadows.	Set of 3 mountain silhouette tea light holders	42.00	\N	EUR	https://picsum.photos/400/300?random=10	[]	ceramics	in_stock	18	f	t	f	\N	\N	\N	["Ceramic", "Heat-resistant Glaze"]	8cm x 8cm x 10cm each	150g each	Wipe clean with damp cloth	["candle", "holder", "ceramic", "mountain"]	\N	\N	\N	\N	tea-light-holders-mountain-silhouette	0.00	0	t	f	2025-08-19 08:58:21.804751+02	2025-08-19 08:58:21.804751+02
9e23b9ba-59ce-4877-864e-c34a5c318e12	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Alpine Pine Cutting Board	Handcrafted cutting board from sustainable Austrian pine. Natural antibacterial properties.	Handcrafted pine cutting board	68.00	\N	EUR	https://picsum.photos/400/300?random=11	[]	woodwork	in_stock	14	f	t	t	Josef Bauer	\N	\N	["Austrian Pine", "Natural Oil Finish"]	40cm x 25cm x 3cm	1.2kg	Hand wash, oil monthly with mineral oil	["cutting board", "pine", "kitchen", "sustainable"]	\N	\N	\N	\N	alpine-pine-cutting-board	0.00	0	t	f	2025-08-19 08:58:21.806341+02	2025-08-19 08:58:21.806341+02
ecea5eb4-220b-4356-8dc1-8490a63cc1ca	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Oak Wine Rack - 8 Bottle	Elegant wine rack handcrafted from Austrian oak. Holds 8 bottles in style.	Handcrafted oak wine rack for 8 bottles	145.00	\N	EUR	https://picsum.photos/400/300?random=12	[]	woodwork	in_stock	5	t	t	f	Josef Bauer	\N	\N	["Austrian Oak", "Beeswax Finish"]	50cm x 20cm x 35cm	3kg	Dust regularly, polish with beeswax annually	["wine", "rack", "oak", "storage"]	\N	\N	\N	\N	oak-wine-rack-8-bottle	0.00	0	t	f	2025-08-19 08:58:21.807987+02	2025-08-19 08:58:21.807987+02
082363e9-bf64-4bcc-9cc4-b50bc690be72	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Maple Serving Tray	Beautiful serving tray with carved handles. Perfect for breakfast in bed or aperitifs.	Maple wood serving tray with carved handles	58.00	\N	EUR	https://picsum.photos/400/300?random=13	[]	woodwork	in_stock	10	f	t	f	\N	\N	\N	["Maple Wood", "Food-safe Varnish"]	45cm x 30cm x 5cm	800g	Wipe clean, do not soak	["tray", "serving", "maple", "kitchen"]	\N	\N	\N	\N	maple-serving-tray	0.00	0	t	f	2025-08-19 08:58:21.809033+02	2025-08-19 08:58:21.809033+02
e82978cc-389c-482f-a36f-5dcb264c41de	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Birch Coaster Set	Set of 6 birch wood coasters with natural bark edges. Protects surfaces with style.	Set of 6 natural birch wood coasters	32.00	\N	EUR	https://picsum.photos/400/300?random=14	[]	woodwork	in_stock	22	f	t	t	\N	\N	\N	["Birch Wood", "Natural Wax"]	10cm diameter x 1cm thick	50g per coaster	Wipe clean, re-wax as needed	["coasters", "birch", "natural", "tableware"]	\N	\N	\N	\N	birch-coaster-set	0.00	0	t	f	2025-08-19 08:58:21.810053+02	2025-08-19 08:58:21.810053+02
d625dc9d-abcd-48b7-b6da-2df7ecafb834	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Carved Wooden Spoon Set	Set of 3 hand-carved wooden spoons. Each piece is unique with natural wood grain.	Set of 3 hand-carved wooden spoons	38.00	\N	EUR	https://picsum.photos/400/300?random=15	[]	woodwork	in_stock	16	f	t	f	Thomas Gruber	\N	\N	["Cherry Wood", "Walnut Oil"]	Various sizes 20-30cm	150g total	Hand wash, oil occasionally	["spoons", "carved", "kitchen", "utensils"]	\N	\N	\N	\N	carved-wooden-spoon-set	0.00	0	t	f	2025-08-19 08:58:21.811596+02	2025-08-19 08:58:21.811596+02
58d55433-4c58-449f-87ab-544e2de28cd2	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Silver Edelweiss Pendant	Sterling silver pendant featuring the iconic Edelweiss flower. Symbol of Alpine beauty.	Sterling silver Edelweiss flower pendant	125.00	\N	EUR	https://picsum.photos/400/300?random=16	[]	jewelry	in_stock	8	t	t	f	Ingrid Fischer	\N	\N	["Sterling Silver", "Silver Chain"]	Pendant: 2cm, Chain: 45cm	10g	Polish with silver cloth	["pendant", "silver", "edelweiss", "necklace"]	\N	\N	\N	\N	silver-edelweiss-pendant	0.00	0	t	f	2025-08-19 08:58:21.81261+02	2025-08-19 08:58:21.81261+02
cbdcc999-9340-48f7-9e53-76f14ab9c780	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Copper Mountain Bracelet	Hand-forged copper bracelet with mountain ridge design. Adjustable size.	Hand-forged copper bracelet with mountain design	68.00	\N	EUR	https://picsum.photos/400/300?random=17	[]	jewelry	in_stock	12	f	t	f	Hans Schmid	\N	\N	["Pure Copper"]	Adjustable 15-20cm	25g	Polish to maintain shine	["bracelet", "copper", "mountain", "adjustable"]	\N	\N	\N	\N	copper-mountain-bracelet	0.00	0	t	f	2025-08-19 08:58:21.813647+02	2025-08-19 08:58:21.813647+02
a8a12e46-453a-4232-8a54-fad7c588ab7b	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Alpine Crystal Earrings	Delicate earrings featuring Austrian crystals. Catch the light beautifully.	Austrian crystal drop earrings	95.00	115.00	EUR	https://picsum.photos/400/300?random=18	[]	jewelry	low_stock	4	f	t	f	\N	\N	\N	["Austrian Crystal", "Silver-plated Hooks"]	3cm drop length	5g per pair	Store in jewelry box	["earrings", "crystal", "austrian", "elegant"]	\N	\N	\N	\N	alpine-crystal-earrings	0.00	0	t	f	2025-08-19 08:58:21.815147+02	2025-08-19 08:58:21.815147+02
75244cb6-629c-41b9-bf29-ec1188125f41	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Wooden Bead Necklace	Natural wooden beads with silver accents. Modern take on traditional Alpine jewelry.	Natural wood bead necklace with silver accents	52.00	\N	EUR	https://picsum.photos/400/300?random=19	[]	jewelry	in_stock	10	f	t	t	\N	\N	\N	["Ash Wood", "Silver Beads"]	50cm length	30g	Keep dry, avoid perfumes	["necklace", "wooden", "beads", "natural"]	\N	\N	\N	\N	wooden-bead-necklace	0.00	0	t	f	2025-08-19 08:58:21.834155+02	2025-08-19 08:58:21.834155+02
f4a7664d-d2ad-4224-a44b-94765aad7033	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Stone Ring - Tyrolean Marble	Unique ring featuring polished Tyrolean marble. Each stone pattern is one of a kind.	Tyrolean marble stone ring	78.00	\N	EUR	https://picsum.photos/400/300?random=20	[]	jewelry	made_to_order	0	f	t	f	Ingrid Fischer	\N	\N	["Tyrolean Marble", "Stainless Steel Band"]	Various sizes available	15g	Remove before swimming	["ring", "marble", "stone", "unique"]	\N	\N	\N	\N	stone-ring-tyrolean-marble	0.00	0	t	f	2025-08-19 08:58:21.837059+02	2025-08-19 08:58:21.837059+02
84a7ab27-5b3f-4de4-aa8d-3146fb7edce6	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Alpine Honey Collection	Set of 3 artisanal honeys: wildflower, forest, and mountain herb. From local beekeepers.	Set of 3 artisanal Alpine honeys	48.00	\N	EUR	https://picsum.photos/400/300?random=21	[]	food	in_stock	20	t	t	f	Familie Berger Imkerei	\N	\N	["100% Pure Honey"]	3 x 250g jars	750g total	Store at room temperature	["honey", "artisanal", "local", "gift"]	\N	\N	\N	\N	alpine-honey-collection	0.00	0	t	f	2025-08-19 08:58:21.83808+02	2025-08-19 08:58:21.83808+02
\.


--
-- Data for Name: shopping_carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shopping_carts (id, guest_id, property_id, session_id, status, created_at, updated_at, expires_at) FROM stdin;
\.


--
-- Data for Name: streaming_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.streaming_services (id, property_id, service_name, service_type, app_url_scheme, logo_url, instructions, requires_login, is_active, display_order, created_at, updated_at) FROM stdin;
9045ebfd-f2a6-4637-a1f5-7b0698ed8e75	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	YouTube	streaming	youtube://	https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/youtube.png	Launch YouTube from the Entertainment section	t	t	4	2025-08-17 17:45:21.221917+02	2025-08-17 17:45:21.221917+02
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Disney+	video	disneyplus	https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/disney-plus.png	Open Disney+ and enjoy family-friendly content	t	t	2	2025-08-13 13:32:11.568072+02	2025-08-17 17:45:27.304036+02
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Prime Video	video	aiv	https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/prime-video.png	Access Amazon Prime Video with your Prime account	t	t	3	2025-08-13 13:32:11.568072+02	2025-08-17 17:45:27.304036+02
11111111-1111-1111-1111-111111111111	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Netflix	video	nflx	https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/netflix.png	Launch Netflix app and sign in with your account	t	t	0	2025-08-13 13:32:11.568072+02	2025-08-17 17:45:27.304036+02
069b5822-64be-490b-aede-ce9c749b8f01	24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b	Apple TV+	streaming	videos://	https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/apple-tv-plus.png	Launch Apple TV+ from the Entertainment section	t	t	4	2025-08-17 17:55:49.464026+02	2025-08-17 17:57:48.677423+02
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, guest_id, product_id, property_id, notes, created_at) FROM stdin;
\.


--
-- Name: background_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alexanderigelsboeck
--

SELECT pg_catalog.setval('public.background_images_id_seq', 14, true);


--
-- Name: dining_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dining_features_id_seq', 944, true);


--
-- Name: dining_hours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dining_hours_id_seq', 1, false);


--
-- Name: dining_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dining_options_id_seq', 140, true);


--
-- Name: dining_places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dining_places_id_seq', 8, true);


--
-- Name: dining_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dining_reviews_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: alexanderigelsboeck
--

SELECT pg_catalog.setval('public.events_id_seq', 77, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: background_images background_images_pkey; Type: CONSTRAINT; Schema: public; Owner: alexanderigelsboeck
--

ALTER TABLE ONLY public.background_images
    ADD CONSTRAINT background_images_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: dining_features dining_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_features
    ADD CONSTRAINT dining_features_pkey PRIMARY KEY (id);


--
-- Name: dining_hours dining_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_hours
    ADD CONSTRAINT dining_hours_pkey PRIMARY KEY (id);


--
-- Name: dining_options dining_options_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_options
    ADD CONSTRAINT dining_options_external_id_key UNIQUE (external_id);


--
-- Name: dining_options dining_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_options
    ADD CONSTRAINT dining_options_pkey PRIMARY KEY (id);


--
-- Name: dining_places dining_places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_places
    ADD CONSTRAINT dining_places_pkey PRIMARY KEY (id);


--
-- Name: dining_reviews dining_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_reviews
    ADD CONSTRAINT dining_reviews_pkey PRIMARY KEY (id);


--
-- Name: events events_external_id_key; Type: CONSTRAINT; Schema: public; Owner: alexanderigelsboeck
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_external_id_key UNIQUE (external_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: alexanderigelsboeck
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: guest_sessions guest_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_sessions
    ADD CONSTRAINT guest_sessions_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: shop_products shop_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_pkey PRIMARY KEY (id);


--
-- Name: shopping_carts shopping_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_pkey PRIMARY KEY (id);


--
-- Name: streaming_services streaming_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streaming_services
    ADD CONSTRAINT streaming_services_pkey PRIMARY KEY (id);


--
-- Name: cart_items unique_product_per_cart; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT unique_product_per_cart UNIQUE (cart_id, product_id, options);


--
-- Name: shop_products unique_sku_per_property; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT unique_sku_per_property UNIQUE (property_id, sku);


--
-- Name: shop_products unique_slug_per_property; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT unique_slug_per_property UNIQUE (property_id, slug);


--
-- Name: wishlists unique_wishlist_item; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT unique_wishlist_item UNIQUE (guest_id, product_id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: idx_activities_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_display_order ON public.activities USING btree (property_id, display_order) WHERE (is_active = true);


--
-- Name: idx_activities_guest_types; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_guest_types ON public.activities USING gin (target_guest_types);


--
-- Name: idx_activities_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_is_active ON public.activities USING btree (is_active);


--
-- Name: idx_activities_multilingual_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_multilingual_content ON public.activities USING gin (multilingual_content);


--
-- Name: idx_activities_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_property_id ON public.activities USING btree (property_id);


--
-- Name: idx_activities_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_season ON public.activities USING btree (season);


--
-- Name: idx_activities_season_months; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_season_months ON public.activities USING btree (season_start_month, season_end_month);


--
-- Name: idx_background_images_active; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_background_images_active ON public.background_images USING btree (is_active);


--
-- Name: idx_background_images_property; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_background_images_property ON public.background_images USING btree (property_id);


--
-- Name: idx_background_images_season; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_background_images_season ON public.background_images USING btree (season);


--
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- Name: idx_cart_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_product_id ON public.cart_items USING btree (product_id);


--
-- Name: idx_devices_is_online; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_is_online ON public.devices USING btree (is_online);


--
-- Name: idx_devices_last_seen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_last_seen ON public.devices USING btree (last_seen);


--
-- Name: idx_devices_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_property_id ON public.devices USING btree (property_id);


--
-- Name: idx_dining_access_car; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_access_car ON public.dining_options USING btree (access_by_car);


--
-- Name: idx_dining_access_difficulty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_access_difficulty ON public.dining_options USING btree (access_difficulty);


--
-- Name: idx_dining_access_hiking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_access_hiking ON public.dining_options USING btree (access_by_hiking);


--
-- Name: idx_dining_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_active ON public.dining_options USING btree (is_active);


--
-- Name: idx_dining_atmosphere; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_atmosphere ON public.dining_options USING btree (atmosphere);


--
-- Name: idx_dining_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_category ON public.dining_options USING btree (category);


--
-- Name: idx_dining_cuisine; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_cuisine ON public.dining_options USING btree (cuisine_type);


--
-- Name: idx_dining_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_event_type ON public.dining_options USING btree (event_type);


--
-- Name: idx_dining_features_dining; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_features_dining ON public.dining_features USING btree (dining_id);


--
-- Name: idx_dining_features_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_features_type ON public.dining_features USING btree (feature_type);


--
-- Name: idx_dining_features_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_features_value ON public.dining_features USING btree (feature_value);


--
-- Name: idx_dining_geo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_geo ON public.dining_options USING btree (latitude, longitude);


--
-- Name: idx_dining_hours_dining; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_hours_dining ON public.dining_hours USING btree (dining_id);


--
-- Name: idx_dining_hours_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_hours_season ON public.dining_hours USING btree (season);


--
-- Name: idx_dining_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_location ON public.dining_options USING btree (location_area);


--
-- Name: idx_dining_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_price ON public.dining_options USING btree (price_range);


--
-- Name: idx_dining_relevance; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_relevance ON public.dining_options USING btree (relevance_status);


--
-- Name: idx_dining_reviews_dining; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_reviews_dining ON public.dining_reviews USING btree (dining_id);


--
-- Name: idx_dining_reviews_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_reviews_rating ON public.dining_reviews USING btree (rating);


--
-- Name: idx_dining_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dining_season ON public.dining_options USING btree (season_recommendation);


--
-- Name: idx_events_active; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_events_active ON public.events USING btree (is_active);


--
-- Name: idx_events_category; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_events_category ON public.events USING btree (category);


--
-- Name: idx_events_featured; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_events_featured ON public.events USING btree (is_featured);


--
-- Name: idx_events_season; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_events_season ON public.events USING btree (season);


--
-- Name: idx_events_season_months; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_events_season_months ON public.events USING btree (season_start_month, season_end_month);


--
-- Name: idx_events_start_date; Type: INDEX; Schema: public; Owner: alexanderigelsboeck
--

CREATE INDEX idx_events_start_date ON public.events USING btree (start_date);


--
-- Name: idx_guest_sessions_auto_logout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guest_sessions_auto_logout ON public.guest_sessions USING btree (auto_logout_scheduled) WHERE (is_active = true);


--
-- Name: idx_guest_sessions_guest_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guest_sessions_guest_id ON public.guest_sessions USING btree (guest_id);


--
-- Name: idx_guest_sessions_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guest_sessions_is_active ON public.guest_sessions USING btree (is_active);


--
-- Name: idx_guests_check_in_out; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_check_in_out ON public.guests USING btree (check_in_date, check_out_date);


--
-- Name: idx_guests_current_stay; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_current_stay ON public.guests USING btree (property_id, check_in_date, check_out_date) WHERE (is_active = true);


--
-- Name: idx_guests_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_is_active ON public.guests USING btree (is_active);


--
-- Name: idx_guests_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guests_property_id ON public.guests USING btree (property_id);


--
-- Name: idx_shop_products_availability; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_availability ON public.shop_products USING btree (availability);


--
-- Name: idx_shop_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_category ON public.shop_products USING btree (category);


--
-- Name: idx_shop_products_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_created_at ON public.shop_products USING btree (created_at DESC);


--
-- Name: idx_shop_products_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_is_active ON public.shop_products USING btree (is_active);


--
-- Name: idx_shop_products_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_is_featured ON public.shop_products USING btree (is_featured);


--
-- Name: idx_shop_products_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_price ON public.shop_products USING btree (price);


--
-- Name: idx_shop_products_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_property_id ON public.shop_products USING btree (property_id);


--
-- Name: idx_shop_products_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_rating ON public.shop_products USING btree (rating_average DESC);


--
-- Name: idx_shop_products_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shop_products_search ON public.shop_products USING gin (to_tsvector('english'::regconfig, (((((name)::text || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || (COALESCE(craftsperson_name, ''::character varying))::text)));


--
-- Name: idx_shopping_carts_guest_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shopping_carts_guest_id ON public.shopping_carts USING btree (guest_id);


--
-- Name: idx_shopping_carts_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shopping_carts_property_id ON public.shopping_carts USING btree (property_id);


--
-- Name: idx_shopping_carts_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shopping_carts_session_id ON public.shopping_carts USING btree (session_id);


--
-- Name: idx_shopping_carts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shopping_carts_status ON public.shopping_carts USING btree (status);


--
-- Name: idx_streaming_services_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_streaming_services_display_order ON public.streaming_services USING btree (property_id, display_order) WHERE (is_active = true);


--
-- Name: idx_streaming_services_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_streaming_services_is_active ON public.streaming_services USING btree (is_active);


--
-- Name: idx_streaming_services_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_streaming_services_property_id ON public.streaming_services USING btree (property_id);


--
-- Name: idx_wishlists_guest_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlists_guest_id ON public.wishlists USING btree (guest_id);


--
-- Name: idx_wishlists_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlists_product_id ON public.wishlists USING btree (product_id);


--
-- Name: idx_wishlists_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wishlists_property_id ON public.wishlists USING btree (property_id);


--
-- Name: activities update_activities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: devices update_devices_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dining_options update_dining_options_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_dining_options_updated_at BEFORE UPDATE ON public.dining_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: alexanderigelsboeck
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();


--
-- Name: guest_sessions update_guest_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_guest_sessions_updated_at BEFORE UPDATE ON public.guest_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: guests update_guests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: properties update_properties_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shop_products update_shop_products_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_shop_products_updated_at_trigger BEFORE UPDATE ON public.shop_products FOR EACH ROW EXECUTE FUNCTION public.update_shop_products_updated_at();


--
-- Name: streaming_services update_streaming_services_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_streaming_services_updated_at BEFORE UPDATE ON public.streaming_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activities activities_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: background_images background_images_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alexanderigelsboeck
--

ALTER TABLE ONLY public.background_images
    ADD CONSTRAINT background_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.shopping_carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.shop_products(id) ON DELETE CASCADE;


--
-- Name: devices devices_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: dining_features dining_features_dining_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_features
    ADD CONSTRAINT dining_features_dining_id_fkey FOREIGN KEY (dining_id) REFERENCES public.dining_options(id) ON DELETE CASCADE;


--
-- Name: dining_hours dining_hours_dining_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_hours
    ADD CONSTRAINT dining_hours_dining_id_fkey FOREIGN KEY (dining_id) REFERENCES public.dining_options(id) ON DELETE CASCADE;


--
-- Name: dining_reviews dining_reviews_dining_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dining_reviews
    ADD CONSTRAINT dining_reviews_dining_id_fkey FOREIGN KEY (dining_id) REFERENCES public.dining_options(id) ON DELETE CASCADE;


--
-- Name: guest_sessions guest_sessions_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_sessions
    ADD CONSTRAINT guest_sessions_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: guest_sessions guest_sessions_streaming_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_sessions
    ADD CONSTRAINT guest_sessions_streaming_service_id_fkey FOREIGN KEY (streaming_service_id) REFERENCES public.streaming_services(id) ON DELETE CASCADE;


--
-- Name: guests guests_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: shop_products shop_products_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: shopping_carts shopping_carts_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: shopping_carts shopping_carts_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_carts
    ADD CONSTRAINT shopping_carts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: streaming_services streaming_services_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streaming_services
    ADD CONSTRAINT streaming_services_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.shop_products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

