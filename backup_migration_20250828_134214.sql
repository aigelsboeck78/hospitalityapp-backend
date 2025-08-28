--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

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

ALTER TABLE IF EXISTS ONLY public.tvos_devices DROP CONSTRAINT IF EXISTS tvos_devices_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.streaming_services DROP CONSTRAINT IF EXISTS streaming_services_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shop_products DROP CONSTRAINT IF EXISTS shop_products_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.push_notification_templates DROP CONSTRAINT IF EXISTS push_notification_templates_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.push_notification_queue DROP CONSTRAINT IF EXISTS push_notification_queue_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.push_notification_log DROP CONSTRAINT IF EXISTS push_notification_log_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.property_information DROP CONSTRAINT IF EXISTS property_information_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mdm_commands DROP CONSTRAINT IF EXISTS mdm_commands_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mdm_commands DROP CONSTRAINT IF EXISTS mdm_commands_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mdm_alerts DROP CONSTRAINT IF EXISTS mdm_alerts_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mdm_alerts DROP CONSTRAINT IF EXISTS mdm_alerts_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.guests DROP CONSTRAINT IF EXISTS guests_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.guest_sessions DROP CONSTRAINT IF EXISTS guest_sessions_streaming_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.guest_sessions DROP CONSTRAINT IF EXISTS guest_sessions_guest_id_fkey;
ALTER TABLE IF EXISTS ONLY public.devices DROP CONSTRAINT IF EXISTS devices_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device_profile_assignments DROP CONSTRAINT IF EXISTS device_profile_assignments_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device_profile_assignments DROP CONSTRAINT IF EXISTS device_profile_assignments_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.configuration_profiles DROP CONSTRAINT IF EXISTS configuration_profiles_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.background_images DROP CONSTRAINT IF EXISTS background_images_property_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_property_id_fkey;
DROP TRIGGER IF EXISTS update_streaming_services_updated_at ON public.streaming_services;
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
DROP TRIGGER IF EXISTS update_guest_sessions_updated_at ON public.guest_sessions;
DROP TRIGGER IF EXISTS update_devices_updated_at ON public.devices;
DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities;
DROP INDEX IF EXISTS public.idx_streaming_services_property_id;
DROP INDEX IF EXISTS public.idx_streaming_services_is_active;
DROP INDEX IF EXISTS public.idx_streaming_services_display_order;
DROP INDEX IF EXISTS public.idx_push_templates_type;
DROP INDEX IF EXISTS public.idx_push_templates_property;
DROP INDEX IF EXISTS public.idx_push_templates_active;
DROP INDEX IF EXISTS public.idx_push_queue_status;
DROP INDEX IF EXISTS public.idx_push_queue_priority;
DROP INDEX IF EXISTS public.idx_push_queue_device;
DROP INDEX IF EXISTS public.idx_push_queue_created;
DROP INDEX IF EXISTS public.idx_push_log_type;
DROP INDEX IF EXISTS public.idx_push_log_status;
DROP INDEX IF EXISTS public.idx_push_log_device;
DROP INDEX IF EXISTS public.idx_push_log_created;
DROP INDEX IF EXISTS public.idx_property_information_unique_type;
DROP INDEX IF EXISTS public.idx_property_information_type;
DROP INDEX IF EXISTS public.idx_property_information_property_id;
DROP INDEX IF EXISTS public.idx_property_information_order;
DROP INDEX IF EXISTS public.idx_property_information_category;
DROP INDEX IF EXISTS public.idx_property_information_active;
DROP INDEX IF EXISTS public.idx_properties_guest_profile_config;
DROP INDEX IF EXISTS public.idx_mdm_commands_status;
DROP INDEX IF EXISTS public.idx_mdm_commands_priority;
DROP INDEX IF EXISTS public.idx_mdm_commands_device;
DROP INDEX IF EXISTS public.idx_mdm_commands_created;
DROP INDEX IF EXISTS public.idx_mdm_alerts_type;
DROP INDEX IF EXISTS public.idx_mdm_alerts_severity;
DROP INDEX IF EXISTS public.idx_mdm_alerts_resolved;
DROP INDEX IF EXISTS public.idx_mdm_alerts_property;
DROP INDEX IF EXISTS public.idx_mdm_alerts_device;
DROP INDEX IF EXISTS public.idx_mdm_alerts_created;
DROP INDEX IF EXISTS public.idx_guests_property_id;
DROP INDEX IF EXISTS public.idx_guests_profile_type;
DROP INDEX IF EXISTS public.idx_guests_is_active;
DROP INDEX IF EXISTS public.idx_guests_current_stay;
DROP INDEX IF EXISTS public.idx_guests_check_in_out;
DROP INDEX IF EXISTS public.idx_guest_sessions_is_active;
DROP INDEX IF EXISTS public.idx_guest_sessions_guest_id;
DROP INDEX IF EXISTS public.idx_guest_sessions_auto_logout;
DROP INDEX IF EXISTS public.idx_dining_places_relevance;
DROP INDEX IF EXISTS public.idx_dining_places_location;
DROP INDEX IF EXISTS public.idx_dining_places_featured;
DROP INDEX IF EXISTS public.idx_dining_places_cuisine;
DROP INDEX IF EXISTS public.idx_dining_places_active;
DROP INDEX IF EXISTS public.idx_devices_supervised;
DROP INDEX IF EXISTS public.idx_devices_room_number;
DROP INDEX IF EXISTS public.idx_devices_provisional_end;
DROP INDEX IF EXISTS public.idx_devices_property_id;
DROP INDEX IF EXISTS public.idx_devices_last_seen;
DROP INDEX IF EXISTS public.idx_devices_kiosk_mode;
DROP INDEX IF EXISTS public.idx_devices_is_online;
DROP INDEX IF EXISTS public.idx_devices_enrollment_status;
DROP INDEX IF EXISTS public.idx_devices_device_status;
DROP INDEX IF EXISTS public.idx_device_profiles_status;
DROP INDEX IF EXISTS public.idx_device_profiles_profile;
DROP INDEX IF EXISTS public.idx_device_profiles_device;
DROP INDEX IF EXISTS public.idx_config_profiles_type;
DROP INDEX IF EXISTS public.idx_config_profiles_property;
DROP INDEX IF EXISTS public.idx_config_profiles_active;
DROP INDEX IF EXISTS public.idx_activities_property_id;
DROP INDEX IF EXISTS public.idx_activities_is_active;
DROP INDEX IF EXISTS public.idx_activities_guest_types;
DROP INDEX IF EXISTS public.idx_activities_display_order;
ALTER TABLE IF EXISTS ONLY public.tvos_devices DROP CONSTRAINT IF EXISTS tvos_devices_pkey;
ALTER TABLE IF EXISTS ONLY public.tvos_devices DROP CONSTRAINT IF EXISTS tvos_devices_identifier_key;
ALTER TABLE IF EXISTS ONLY public.streaming_services DROP CONSTRAINT IF EXISTS streaming_services_pkey;
ALTER TABLE IF EXISTS ONLY public.shop_products DROP CONSTRAINT IF EXISTS shop_products_pkey;
ALTER TABLE IF EXISTS ONLY public.push_notification_templates DROP CONSTRAINT IF EXISTS push_notification_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.push_notification_queue DROP CONSTRAINT IF EXISTS push_notification_queue_pkey;
ALTER TABLE IF EXISTS ONLY public.push_notification_log DROP CONSTRAINT IF EXISTS push_notification_log_pkey;
ALTER TABLE IF EXISTS ONLY public.property_information DROP CONSTRAINT IF EXISTS property_information_pkey;
ALTER TABLE IF EXISTS ONLY public.properties DROP CONSTRAINT IF EXISTS properties_pkey;
ALTER TABLE IF EXISTS ONLY public.mdm_commands DROP CONSTRAINT IF EXISTS mdm_commands_pkey;
ALTER TABLE IF EXISTS ONLY public.mdm_alerts DROP CONSTRAINT IF EXISTS mdm_alerts_pkey;
ALTER TABLE IF EXISTS ONLY public.guests DROP CONSTRAINT IF EXISTS guests_pkey;
ALTER TABLE IF EXISTS ONLY public.guest_sessions DROP CONSTRAINT IF EXISTS guest_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_external_id_key;
ALTER TABLE IF EXISTS ONLY public.dining_places DROP CONSTRAINT IF EXISTS dining_places_pkey;
ALTER TABLE IF EXISTS ONLY public.dining_options DROP CONSTRAINT IF EXISTS dining_options_pkey;
ALTER TABLE IF EXISTS ONLY public.dining_options DROP CONSTRAINT IF EXISTS dining_options_external_id_key;
ALTER TABLE IF EXISTS ONLY public.devices DROP CONSTRAINT IF EXISTS devices_pkey;
ALTER TABLE IF EXISTS ONLY public.devices DROP CONSTRAINT IF EXISTS devices_identifier_key;
ALTER TABLE IF EXISTS ONLY public.device_profile_assignments DROP CONSTRAINT IF EXISTS device_profile_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.device_profile_assignments DROP CONSTRAINT IF EXISTS device_profile_assignments_device_id_profile_id_key;
ALTER TABLE IF EXISTS ONLY public.configuration_profiles DROP CONSTRAINT IF EXISTS configuration_profiles_profile_uuid_key;
ALTER TABLE IF EXISTS ONLY public.configuration_profiles DROP CONSTRAINT IF EXISTS configuration_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.background_images DROP CONSTRAINT IF EXISTS background_images_pkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_pkey;
ALTER TABLE IF EXISTS public.tvos_devices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.dining_options ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.tvos_devices_id_seq;
DROP TABLE IF EXISTS public.tvos_devices;
DROP TABLE IF EXISTS public.streaming_services;
DROP TABLE IF EXISTS public.shop_products;
DROP TABLE IF EXISTS public.push_notification_templates;
DROP TABLE IF EXISTS public.push_notification_queue;
DROP TABLE IF EXISTS public.push_notification_log;
DROP TABLE IF EXISTS public.property_information;
DROP TABLE IF EXISTS public.properties;
DROP TABLE IF EXISTS public.mdm_commands;
DROP TABLE IF EXISTS public.mdm_alerts;
DROP TABLE IF EXISTS public.guests;
DROP TABLE IF EXISTS public.guest_sessions;
DROP SEQUENCE IF EXISTS public.events_id_seq;
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.dining_places;
DROP SEQUENCE IF EXISTS public.dining_options_id_seq;
DROP TABLE IF EXISTS public.dining_options;
DROP TABLE IF EXISTS public.devices;
DROP TABLE IF EXISTS public.device_profile_assignments;
DROP TABLE IF EXISTS public.configuration_profiles;
DROP TABLE IF EXISTS public.background_images;
DROP TABLE IF EXISTS public.activities;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TYPE IF EXISTS public.guest_type;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: guest_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.guest_type AS ENUM (
    'family',
    'all_male',
    'all_female',
    'couple',
    'business',
    'solo',
    'group',
    'wedding',
    'event'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
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
    multilingual_content jsonb
);


--
-- Name: background_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.background_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid,
    image_url character varying(500) NOT NULL,
    title character varying(255),
    description text,
    season character varying(50) DEFAULT 'all'::character varying,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    upload_type character varying(50) DEFAULT 'upload'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    filename character varying(255),
    file_path text,
    upload_date timestamp with time zone DEFAULT now()
);


--
-- Name: configuration_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid,
    name character varying(255) NOT NULL,
    description text,
    profile_type character varying(50) NOT NULL,
    profile_uuid character varying(255),
    profile_content jsonb NOT NULL,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: device_profile_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_profile_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    installed_at timestamp without time zone,
    status character varying(50) DEFAULT 'pending'::character varying,
    error_message text
);


--
-- Name: devices; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp with time zone DEFAULT now(),
    identifier character varying(255),
    serial_number character varying(100),
    model character varying(255),
    os_version character varying(50),
    app_version character varying(50),
    is_active boolean DEFAULT true,
    is_primary boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    push_token character varying(500),
    last_connected timestamp without time zone,
    last_ip_address inet,
    supervised boolean DEFAULT false,
    enrollment_status character varying(50) DEFAULT 'not_enrolled'::character varying,
    enrollment_date timestamp without time zone,
    provisional_period_end timestamp without time zone,
    mdm_profile_uuid character varying(255),
    configuration_profiles jsonb DEFAULT '[]'::jsonb,
    kiosk_mode_enabled boolean DEFAULT false,
    kiosk_mode_config jsonb DEFAULT '{}'::jsonb,
    allowed_apps jsonb DEFAULT '[]'::jsonb,
    restrictions jsonb DEFAULT '{}'::jsonb,
    last_command_sent timestamp without time zone,
    last_command_status character varying(50),
    pending_commands jsonb DEFAULT '[]'::jsonb,
    command_history jsonb DEFAULT '[]'::jsonb,
    room_number character varying(50),
    device_status character varying(50) DEFAULT 'unknown'::character varying,
    last_heartbeat timestamp without time zone,
    battery_level integer,
    storage_available bigint,
    storage_total bigint
);


--
-- Name: dining_options; Type: TABLE; Schema: public; Owner: -
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
    CONSTRAINT dining_options_price_range_check CHECK (((price_range >= 1) AND (price_range <= 5)))
);


--
-- Name: dining_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dining_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dining_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dining_options_id_seq OWNED BY public.dining_options.id;


--
-- Name: dining_places; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dining_places (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid,
    name character varying(255),
    description text,
    cuisine_type character varying(100),
    price_range character varying(50),
    image_url text,
    website character varying(255),
    phone character varying(50),
    reservation_url character varying(255),
    reservation_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    name_de character varying(255),
    name_en character varying(255),
    category character varying(100),
    location_area character varying(100),
    street_address character varying(255),
    postal_code character varying(20),
    city character varying(100),
    altitude_m integer,
    email character varying(255),
    hours_winter text,
    hours_summer text,
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
    reservations_required boolean DEFAULT false,
    season_recommendation character varying(50),
    relevance_status character varying(50),
    latitude numeric(10,8),
    longitude numeric(11,8),
    opening_hours jsonb,
    rating numeric(2,1),
    tags text[],
    is_featured boolean DEFAULT false,
    atmosphere character varying(50),
    event_type character varying(100),
    target_guest_types text[],
    access_by_car boolean DEFAULT false,
    access_by_cable_car boolean DEFAULT false,
    access_by_hiking boolean DEFAULT false,
    access_by_bike boolean DEFAULT false,
    access_by_lift boolean DEFAULT false,
    access_by_public_transport boolean DEFAULT false,
    access_difficulty character varying(50),
    access_time_minutes integer,
    access_notes text,
    location character varying(255),
    external_id character varying(50)
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: guest_sessions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
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
    name character varying(255),
    room_number character varying(50),
    status character varying(50) DEFAULT 'reserved'::character varying,
    language character varying(10) DEFAULT 'en'::character varying,
    profile_type character varying(50) DEFAULT 'family'::character varying,
    adults integer DEFAULT 2,
    children integer DEFAULT 0,
    children_ages integer[] DEFAULT '{}'::integer[],
    preferences jsonb DEFAULT '{}'::jsonb,
    dietary_restrictions text[] DEFAULT '{}'::text[],
    accessibility_needs text[] DEFAULT '{}'::text[],
    allergies text[] DEFAULT '{}'::text[],
    preferred_activities text[] DEFAULT '{}'::text[],
    budget_preference character varying(20) DEFAULT 'moderate'::character varying,
    special_occasions text,
    profile_completed boolean DEFAULT false,
    profile_completion_percentage integer DEFAULT 0
);


--
-- Name: mdm_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mdm_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid,
    property_id uuid NOT NULL,
    alert_type character varying(100) NOT NULL,
    severity character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp without time zone,
    resolved_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: mdm_commands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mdm_commands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    property_id uuid NOT NULL,
    command_type character varying(100) NOT NULL,
    command_payload jsonb DEFAULT '{}'::jsonb,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sent_at timestamp without time zone,
    acknowledged_at timestamp without time zone,
    completed_at timestamp without time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    CONSTRAINT valid_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'acknowledged'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
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
    shop_enabled boolean DEFAULT false,
    guest_profile_config jsonb DEFAULT '{"enabled": true, "preferences": {"budget": {"label": "Budget Preference", "enabled": true, "options": ["Budget", "Moderate", "Premium", "Luxury"]}, "dietary": {"label": "Dietary Restrictions", "enabled": true, "options": ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Halal", "Kosher", "Nut-Free"]}, "languages": {"label": "Languages", "enabled": true, "options": ["EN", "DE", "FR", "IT", "ES", "NL", "PL", "RU", "ZH", "JA"]}, "activities": {"label": "Preferred Activities", "enabled": true, "options": ["Skiing", "Hiking", "Swimming", "Dining", "Shopping", "Spa", "Tours", "Museums", "Playgrounds", "Family Restaurants", "Kid Activities"]}, "accessibility": {"label": "Accessibility Needs", "enabled": true, "options": ["Wheelchair Access", "Elevator Required", "Ground Floor", "Hearing Assistance", "Visual Assistance"]}}, "party_details": {"pets": {"max": 3, "min": 0, "default": 0, "enabled": false}, "adults": {"max": 10, "min": 1, "default": 2, "enabled": true}, "children": {"max": 10, "min": 0, "default": 0, "enabled": true}}, "profile_types": {"couple": {"icon": "heart.fill", "label": "Couple", "enabled": true, "description": "Romantic experiences for two"}, "family": {"icon": "person.3.fill", "label": "Family", "enabled": true, "description": "Perfect for families with children"}, "business": {"icon": "briefcase.fill", "label": "Business", "enabled": true, "description": "Professional stays with amenities"}, "wellness": {"icon": "leaf.fill", "label": "Wellness", "enabled": true, "description": "Focus on relaxation and health"}, "adventure": {"icon": "figure.hiking", "label": "Adventure", "enabled": true, "description": "Thrill-seekers welcome!"}}, "additional_fields": {"arrival_time": {"type": "time", "label": "Arrival Time", "enabled": false}, "transportation": {"label": "Transportation Method", "enabled": false, "options": ["Car", "Train", "Plane", "Bus"]}, "special_occasions": {"type": "text", "label": "Special Occasions", "enabled": true}}}'::jsonb
);


--
-- Name: COLUMN properties.guest_profile_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.properties.guest_profile_config IS 'Configuration for guest profile options shown in tvOS app';


--
-- Name: property_information; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_information (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid,
    category character varying(100) NOT NULL,
    type character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    instructions text,
    icon character varying(50),
    url character varying(500),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE property_information; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.property_information IS 'Stores property amenities, rules, and general information';


--
-- Name: push_notification_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_notification_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid,
    notification_type character varying(100) NOT NULL,
    status character varying(50) NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: push_notification_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_notification_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    notification_type character varying(100) NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority integer DEFAULT 0,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sent_at timestamp without time zone,
    error_message text,
    CONSTRAINT valid_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: push_notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_notification_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid,
    name character varying(255) NOT NULL,
    notification_type character varying(100) NOT NULL,
    title character varying(255),
    message text,
    payload_template jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: shop_products; Type: TABLE; Schema: public; Owner: -
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
    CONSTRAINT shop_products_original_price_check CHECK ((original_price >= (0)::numeric)),
    CONSTRAINT shop_products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT shop_products_stock_count_check CHECK ((stock_count >= 0))
);


--
-- Name: streaming_services; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: tvos_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tvos_devices (
    id integer NOT NULL,
    identifier character varying(255) NOT NULL,
    property_id uuid,
    device_name character varying(255),
    device_type character varying(100) DEFAULT 'apple_tv'::character varying,
    model character varying(100),
    os_version character varying(50),
    app_version character varying(50),
    serial_number character varying(255),
    is_active boolean DEFAULT true,
    last_seen timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tvos_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tvos_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tvos_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tvos_devices_id_seq OWNED BY public.tvos_devices.id;


--
-- Name: dining_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_options ALTER COLUMN id SET DEFAULT nextval('public.dining_options_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: tvos_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tvos_devices ALTER COLUMN id SET DEFAULT nextval('public.tvos_devices_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activities (id, property_id, title, description, image_url, activity_type, target_guest_types, location, contact_info, operating_hours, price_range, booking_required, booking_url, booking_phone, is_active, display_order, created_at, updated_at, activity_labels, weather_suitability, title_de, description_de, multilingual_content) FROM stdin;
b6548217-9c32-4e4d-a5c1-3699d6b8a339	41059600-402d-434e-9b34-2b4821f6e3a4	Erlebnisbad Schladming	Indoor pool with 66 m slide, kids area, sauna & fitness—perfect for rainy days.	\N	indoor	{family,couple,solo,all_male,all_female}	Schladming	\N	\N	\N	f	https://erlebnisbad-schladming.at/	\N	t	5	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.313007+00	{indoor}	{indoor,rain,any}	Erlebnisbad Schladming	Hallenbad mit 66 m Rutsche, Kinderbereich, Sauna & Fitness – ideal bei Regen.	{"de": {"title": "Erlebnisbad Schladming", "description": "Hallenbad mit 66 m Rutsche, Kinderbereich, Sauna & Fitness – ideal bei Regen."}, "en": {"title": "Erlebnisbad Schladming", "description": "Indoor pool with 66 m slide, kids area, sauna & fitness—perfect for rainy days."}}
f2e99c1f-d75d-4132-809c-50edfca7635d	41059600-402d-434e-9b34-2b4821f6e3a4	Mirror Lake Trail (Reiteralm)	Easy, scenic 4.2 km trail (~1 h 40 min) from Preunegg Jet to Spiegelsee & Obersee, famed for Dachstein reflections.	https://www.reiteralm.at/sommer/stille-wasser/stille-wasser/image-thumb__425__lightbox/004spiegelsee.webp	wellness	{family,couple,family}	Reiteralm				f	https://www.schladming-dachstein.at/en/regional-and-offerings/tours/From-the-Reiteralm-to-famous-Mirror-Lake_td_370661		t	1	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.296202+00	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Wanderung zum Spiegelsee (Reiteralm)	Leichte, malerische 4,2 km Wanderung (~1 h 40 min) ab Preunegg Jet zu Spiegelsee & Obersee. Berühmt für Dachstein-Spiegelungen.	{"de": {"title": "Wanderung zum Spiegelsee (Reiteralm)", "description": "Leichte, malerische 4,2 km Wanderung (~1 h 40 min) ab Preunegg Jet zu Spiegelsee & Obersee. Berühmt für Dachstein-Spiegelungen."}, "en": {"title": "Mirror Lake Trail (Reiteralm)", "description": "Easy, scenic 4.2 km trail (~1 h 40 min) from Preunegg Jet to Spiegelsee & Obersee, famed for Dachstein reflections."}}
99ba3d56-f15f-4b15-97a1-6f8f8f8a9f54	41059600-402d-434e-9b34-2b4821f6e3a4	Mirror Lake Extended Loop	Extended route: return via Untersee (+30 min) or loop via Rippetegg & Gasselhöhe (+2 h).	\N	adventure	{all_male,all_female,solo}	Reiteralm	\N	May–Oct	\N	f	https://www.reiteralm.at/de/sommer/wandern/wandertouren/Spiegelsee	\N	t	0	2025-08-19 15:53:20.305793+00	2025-08-19 15:53:20.305793+00	{intense/adventure}	{sunny,partly_cloudy}	Spiegelsee erweiterte Runde	Erweiterung mit Rückweg über Untersee (+ 30 min) oder große Runde über Rippetegg & Gasselhöhe (+ 2 h).	{"de": {"title": "Spiegelsee erweiterte Runde", "description": "Erweiterung mit Rückweg über Untersee (+ 30 min) oder große Runde über Rippetegg & Gasselhöhe (+ 2 h)."}, "en": {"title": "Mirror Lake Extended Loop", "description": "Extended route: return via Untersee (+30 min) or loop via Rippetegg & Gasselhöhe (+2 h)."}}
a973fef8-bbec-4af6-91f3-84ef3aa69217	41059600-402d-434e-9b34-2b4821f6e3a4	Adventure Park Gröbming	Forest high-rope park: 18–22 courses, 200+ stations—great for families/groups.	\N	adventure	{all_male,all_female,solo}	Gröbming	\N	\N	\N	f	https://www.abenteuerpark.at/	\N	t	7	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.314723+00	{intense/adventure}	{sunny,partly_cloudy}	Abenteuerpark Gröbming	Hochseilpark im Wald: 18–22 Parcours, 200+ Stationen; ideal für Familien/Gruppen.	{"de": {"title": "Abenteuerpark Gröbming", "description": "Hochseilpark im Wald: 18–22 Parcours, 200+ Stationen; ideal für Familien/Gruppen."}, "en": {"title": "Adventure Park Gröbming", "description": "Forest high-rope park: 18–22 courses, 200+ stations—great for families/groups."}}
ee614a52-9c03-4d3a-9562-6461e73fad47	41059600-402d-434e-9b34-2b4821f6e3a4	Rittisberg Coaster	1.3 km alpine coaster with spirals and banked turns; operates in sun or rain.	https://www.rittisberg.at/assets/images/heads/sommerrodelbahn-coaster-am-rittisberg-ramsau.webp	recreation	{family,all_male,all_female,couple,business,solo}	Ramsau				f			t	4	2025-08-19 12:24:35.932888+00	2025-08-20 15:11:18.253208+00	{family,intense}	{sunny}			\N
898d3752-5ac1-4c89-b2bc-53dc270ccd09	41059600-402d-434e-9b34-2b4821f6e3a4	Complete Lake Circuit (Spiegelsee & Untersee)	~5.1 km circuit (~3 h with breaks) covering Spiegelsee, Untersee, Waldsee; ideal scenic loop.	https://www.reiteralm.at/sommer/2018/image-thumb__6158__lightbox/_DSC4783.webp	wellness	{family,couple,family}	Reiteralm		May–Oct		f	https://www.reiteralm.at/de/sommer/wandern/wandertouren/Stille-Wasser		t	0	2025-08-19 15:53:20.302215+00	2025-08-20 07:24:27.126454+00	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Komplette Seenrunde (Spiegelsee & Untersee)	Ca. 5,1 km Rundweg (~3 h inkl. Pausen) über Spiegelsee, Untersee, Waldsee; ideal.	\N
882e1d0f-4660-4aab-a74d-f4ca07ac7f14	41059600-402d-434e-9b34-2b4821f6e3a4	Enns Bike Path	Scenic river bike path with easy family sections through valleys & lakes.	https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ennsradweg_bei_Radstadt.jpg/1200px-Ennsradweg_bei_Radstadt.jpg	outdoor	{family,couple}	Enns Valley			FREE	f	https://www.schladming-dachstein.at/en/summer/biking/enns-bike-path		t	10	2025-08-19 12:24:35.932888+00	2025-08-20 11:55:24.440502+00	{family-friendly,family,girls_weekend,boys_weekend}	{sunny,partly_cloudy,cloudy}	Ennsradweg	Malerischer Flussradweg mit familienfreundlichen Abschnitten durch Täler & Seen.	\N
9b6ac50a-fa7f-4d56-949f-cab243ec97fb	41059600-402d-434e-9b34-2b4821f6e3a4	Gasselhöhe–Spiegelsee–Obersee Panorama	Trail from Gasselhöhe hut through forest to Spiegelsee; optional ascent to Rippetegg (2,126 m) via Obersee.	https://files.bergwelten.com/t_image/c_fill,f_auto,w_2000,h_1391/tour/images/rundweg-gasselhoehe-mit-spiegelsee-12442-2.jpg	adventure	{all_male,all_female,solo,all_male,all_female}	Reiteralm		Summer (good weather)		f	https://www.bergwelten.com/t/w/12442		t	0	2025-08-19 15:53:20.304703+00	2025-08-20 11:56:36.324642+00	{intense/adventure,"girls/boys weekend",family,intense}	{sunny,partly_cloudy,cloudy}	Gasselhöhe–Spiegelsee–Obersee Panorama	Wanderung zur Gasselhöhe, durch Wald zum Spiegelsee; optionale Besteigung Rippetegg (2 126 m) über Obersee.	\N
0fc33f51-713a-49cc-8c3f-48b5a25f6917	41059600-402d-434e-9b34-2b4821f6e3a4	Schafsinn Circular Trail	Family loop with barefoot/sheep-themed stations; short stroller (40 min) or full hiker loop (1 h 45 min).	\N	wellness	{family,couple,family}	Hauser Kaibling	\N	Summer	\N	f	https://www.schladming-dachstein.at/en/regional-and-offerings/tours/Circular-hiking-trail-sheep-sense-at-Hauser-Kaibling_td_370680	\N	t	0	2025-08-19 15:53:20.30946+00	2025-08-19 15:53:20.30946+00	{family-friendly,chill/relaxing}	{sunny,partly_cloudy}	Schafsinn-Rundweg	Familienrunde mit Barfuß-/"Schafsinn"-Stationen; kurze kinderwagentaugliche Schleife (40 min) oder volle Runde (1 h 45 min).	{"de": {"title": "Schafsinn-Rundweg", "description": "Familienrunde mit Barfuß-/\\"Schafsinn\\"-Stationen; kurze kinderwagentaugliche Schleife (40 min) oder volle Runde (1 h 45 min)."}, "en": {"title": "Schafsinn Circular Trail", "description": "Family loop with barefoot/sheep-themed stations; short stroller (40 min) or full hiker loop (1 h 45 min)."}}
cdec9fbb-6a9e-474c-bcee-db4d87893c41	41059600-402d-434e-9b34-2b4821f6e3a4	Zipline Stoderzinken	Europe's mega zipline: 2.5 km, ~115 km/h, four parallel lines—adrenaline rush.	\N	adventure	{all_male,all_female,solo}	Gröbming	\N	\N	\N	f	https://www.zipline.at/en	\N	t	8	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.315489+00	{intense/adventure}	{sunny,partly_cloudy}	Zipline Stoderzinken	Europas Mega-Zipline: 2,5 km, bis ~115 km/h, vier Seile – Adrenalinkick pur.	{"de": {"title": "Zipline Stoderzinken", "description": "Europas Mega-Zipline: 2,5 km, bis ~115 km/h, vier Seile – Adrenalinkick pur."}, "en": {"title": "Zipline Stoderzinken", "description": "Europe’s mega zipline: 2.5 km, ~115 km/h, four parallel lines—adrenaline rush."}}
b2becaf1-c2e6-45f9-b720-0cd65cd004da	41059600-402d-434e-9b34-2b4821f6e3a4	Therme Amadé (Altenmarkt)	Spa & water world with slides (incl. loop), pools & saunas; open 09:00–22:00.	https://lh3.googleusercontent.com/p/AF1QipMpLdI5QsTbu3kydHq3B93-ut0Lru703AHWqEMe=s1360-w1360-h1020-rw	indoor	{family,couple,solo,all_male,all_female}	Altenmarkt				t	https://www.thermeamade.at/en/		t	6	2025-08-19 12:24:35.932888+00	2025-08-19 18:20:34.304335+00	{indoor,all-weather,family,intense,girls_weekend,boys_weekend,chill}	{indoor,rain,any}	Erlebnis-Therme	Familien-Therme mit Rutschen (inkl. Looping), Becken & Saunawelt; täglich 09–22 Uhr.	\N
2b84dedc-8097-44ae-8394-9d4b281ee77f	41059600-402d-434e-9b34-2b4821f6e3a4	Reiteralm Lake Stroller Loop	Easy circular walk from Preunegg Jet around Reiteralm Lake; flat and stroller-friendly.	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRT9KkxMAzirk7W65r8I4dISL4m4JkBjxnObOmUL54kDgZuaHhU&s	wellness	{family,couple,family}	Reiteralm		Summer		f	https://www.schladming-dachstein.at/en/summer/excursion-mountains/reiteralm-summer		t	0	2025-08-19 15:53:20.307104+00	2025-08-19 19:40:43.805187+00	{family-friendly,chill/relaxing,family}	{sunny,partly_cloudy,cloudy}	Reiteralmsee Rundweg (kinderwagentauglich)	Leichter Rundweg ab Preunegg-Jet um den Reiteralmsee; flach und kinderwagentauglich.	\N
9f9f0739-8d04-42be-8d3a-ffea3c0ae2a4	41059600-402d-434e-9b34-2b4821f6e3a4	Hopsiland Planai (Playground Trail)	Elevated playground loop with slides, water play, marble runs, lift access — 1.5 km stroller-friendly.	https://www.planai.at/_planai/3_sommer/3_hopsiland/Wasserwelt/image-thumb__25666__gallery/1-112_wasser_%28c%29Christine%20H%C3%B6flehner.webp	wellness	{family,family}	Planai			FREE	f	https://www.planai.at/en/summer/hopsiland-planai		t	3	2025-08-19 12:24:35.932888+00	2025-08-20 13:43:00.583751+00	{family-friendly,chill/relaxing,family}	{sunny,partly_cloudy}	Hopsiland Planai	Höchstgelegener Spielplatz: 1,5 km kinderwagentauglicher Rundweg auf Planai mit Rutschen, Wasserspielen etc.	\N
28ef9fc9-c04e-4772-9014-ba85a7bbbaf5	41059600-402d-434e-9b34-2b4821f6e3a4	Dachstein Skywalk + Ice Palace	Glacier attractions: skywalk, suspension bridge, glass stairway, plus Ice Palace.	https://www.derdachstein.at/_dachstein/2_dachstein-gletscherwelt/gletschererlebnis/hangebrucke/image-thumb__114135__header-image/Header_H%C3%A4ngebr%C3%BCcke_JoshAbsenger_1.webp	adventure	{all_male,all_female,solo,family,couple}	Dachstein				f	https://www.derdachstein.at/en/dachstein-glacier-world/glacier-experience/suspension-bridge		t	2	2025-08-19 12:24:35.932888+00	2025-08-20 15:07:47.561204+00	{intense/adventure,all-weather*,intense,family}	{sunny,partly_cloudy}	Dachstein Skywalk, Suspension Bridge, "Stairway to Nothingness" & Ice Palace	Gletscher-Attraktionen: Skywalk, Hängebrücke, gläserne Treppe „ins Nichts“ und Eispalast.	\N
05992f60-bbcc-4f16-b5ed-caca8a54372c	41059600-402d-434e-9b34-2b4821f6e3a4	Tandem Paragliding	Soar over Schladming with certified pilots.	\N	adventure	{all_male,all_female,solo}	Planai/Hochwurzen	\N	\N	\N	f	https://www.planai.at/en/summer/paragliding	\N	t	9	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.316208+00	{intense/adventure}	{sunny,partly_cloudy}	Tandem-Paragleiten	Über Schladming schweben mit staatlich geprüften Piloten.	{"de": {"title": "Tandem-Paragleiten", "description": "Über Schladming schweben mit staatlich geprüften Piloten."}, "en": {"title": "Tandem Paragliding", "description": "Soar over Schladming with certified pilots."}}
73846cda-a3c6-4399-bed9-2db835dcb1bb	41059600-402d-434e-9b34-2b4821f6e3a4	Rafting on the Enns	Beginner-friendly white-water rafting with local guides.	\N	adventure	{all_male,all_female,solo}	Enns	\N	\N	\N	f	https://www.rafting.at/en.html	\N	t	11	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.317854+00	{intense/adventure}	{sunny,partly_cloudy}	Rafting auf der Enns	Einsteigerfreundliches Wildwasser mit lokalen Guides.	{"de": {"title": "Rafting auf der Enns", "description": "Einsteigerfreundliches Wildwasser mit lokalen Guides."}, "en": {"title": "Rafting on the Enns", "description": "Beginner-friendly white-water rafting with local guides."}}
93cb947a-1c06-47a8-9e42-a70ac6eb913b	41059600-402d-434e-9b34-2b4821f6e3a4	Schladming Brewery Tour	Local "green" brewery—visit shop or tasting, great on rainy days.	\N	indoor	{couple,family}	Schladming	\N	\N	\N	f	https://www.schladmingerbier.at/	\N	t	12	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.318525+00	{chill/relaxing,indoor}	{indoor,rain,any}	Schladminger Brauerei	Regionale „Green Brewery“ mit Shop/Verkostung—ideal bei Regen.	{"de": {"title": "Schladminger Brauerei", "description": "Regionale „Green Brewery“ mit Shop/Verkostung—ideal bei Regen."}, "en": {"title": "Schladming Brewery Tour", "description": "Local \\"green\\" brewery—visit shop or tasting, great on rainy days."}}
ba3521c2-0841-4521-af46-8fc73d6b6f2a	41059600-402d-434e-9b34-2b4821f6e3a4	Golfclub Schladming-Dachstein	18-hole "Pebble Beach of the Alps", picturesque and challenging.	\N	wellness	{couple,family}	Haus im Ennstal	\N	\N	\N	f	https://www.schladming-golf.at/en/home/	\N	t	13	2025-08-19 12:24:35.932888+00	2025-08-19 15:53:20.319265+00	{chill/relaxing}	{sunny,partly_cloudy}	Golfclub Schladming-Dachstein	18-Loch-„Pebble Beach der Alpen“: malerisch und sportlich.	{"de": {"title": "Golfclub Schladming-Dachstein", "description": "18-Loch-„Pebble Beach der Alpen“: malerisch und sportlich."}, "en": {"title": "Golfclub Schladming-Dachstein", "description": "18-hole \\"Pebble Beach of the Alps\\", picturesque and challenging."}}
24aa797f-064b-4490-bd70-e35e17c3da4e	41059600-402d-434e-9b34-2b4821f6e3a4	Moaralmsee Alpine Loop	Scenic summit hike over Hauser Kaibling (2,015 m) with panoramic views, descent to turquoise lake via trail 45.	https://www.schladming-dachstein.at/General%20Solution/Images/121371943/image-thumb__1807233__gallery-slider/53529392_1051633551@2x.webp	adventure	{all_male,all_female,solo}	Hauser Kaibling		Summer	FREE	f	https://www.schladming-dachstein.at/en/regional-and-offerings/tours/Hauser-Kaibling-Moaralmsee-Hans-Wodl-Hutte-Steirischer-Bodensee_td_9999946/		t	0	2025-08-19 15:53:20.308407+00	2025-08-20 12:28:27.737474+00	{intense/adventure,family,intense,girls_weekend,boys_weekend}	{sunny,partly_cloudy,cloudy}	Alpiner Rundweg Moaralmsee	Gipfelwanderung über Hauser Kaibling (2 015 m) mit Panoramablick, Abstieg zum türkisfarbenen Moaralmsee via Weg 45.	\N
\.


--
-- Data for Name: background_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.background_images (id, property_id, image_url, title, description, season, is_active, display_order, upload_type, created_at, updated_at, filename, file_path, upload_date) FROM stdin;
6552ba52-80cd-42fe-98ef-c750ec34a69e	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071554-195059629.jpeg	\N	\N	all	t	0	upload	2025-08-19 07:39:47.747479+00	2025-08-19 07:39:47.747479+00	bg-1755588071554-195059629.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071554-195059629.jpeg	2025-08-19 07:39:47.747479+00
2f703126-35d6-471f-a044-a15ae3120d77	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937533-275978786.jpeg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.545745+00	2025-08-19 08:08:57.545745+00	bg-1755590937533-275978786.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937533-275978786.jpeg	2025-08-19 08:08:57.545745+00
e8115997-ce0e-47d6-89ad-8ded0f81de26	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937553-654609361.jpg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.560907+00	2025-08-19 08:08:57.560907+00	bg-1755590937553-654609361.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937553-654609361.jpg	2025-08-19 08:08:57.560907+00
51899062-aa64-478f-b487-56ca2bec0523	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937566-221528512.jpg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.579776+00	2025-08-19 08:08:57.579776+00	bg-1755590937566-221528512.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937566-221528512.jpg	2025-08-19 08:08:57.579776+00
e43c5ade-4649-4b56-a4b1-3eca59fa494c	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937585-789277951.jpeg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.587182+00	2025-08-19 08:08:57.587182+00	bg-1755590937585-789277951.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937585-789277951.jpeg	2025-08-19 08:08:57.587182+00
a327f8e2-d066-4ef6-a9e5-0948772054ff	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937592-771713521.jpg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.598089+00	2025-08-19 08:08:57.598089+00	bg-1755590937592-771713521.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937592-771713521.jpg	2025-08-19 08:08:57.598089+00
f8830962-75c7-40e2-bc92-377225355018	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937603-459617195.jpg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.606944+00	2025-08-19 08:08:57.606944+00	bg-1755590937603-459617195.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937603-459617195.jpg	2025-08-19 08:08:57.606944+00
7283fe4c-abe5-43c5-95c4-b59851d18b1c	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937611-68382219.jpg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.613774+00	2025-08-19 08:08:57.613774+00	bg-1755590937611-68382219.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937611-68382219.jpg	2025-08-19 08:08:57.613774+00
4e7c3912-9300-44bf-a4ee-758201344960	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937618-642353863.jpg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.62097+00	2025-08-19 08:08:57.62097+00	bg-1755590937618-642353863.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937618-642353863.jpg	2025-08-19 08:08:57.62097+00
ba920375-f383-47fa-a9de-9d8c5b290a7a	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937625-775354797.jpg	\N	\N	summer	t	0	upload	2025-08-19 08:08:57.62807+00	2025-08-19 08:08:57.62807+00	bg-1755590937625-775354797.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937625-775354797.jpg	2025-08-19 08:08:57.62807+00
439f30e5-27e6-44c3-8eee-0679a8f44caa	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071554-195059629.jpeg	\N	\N	all	t	0	upload	2025-08-19 08:10:16.475256+00	2025-08-19 08:10:16.475256+00	bg-1755588071554-195059629.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071554-195059629.jpeg	2025-08-19 08:10:16.475256+00
5ba8724f-3495-4eb6-9a50-c96a35b67fb6	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071574-172928463.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:16.595988+00	2025-08-19 08:10:16.595988+00	bg-1755588071574-172928463.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071574-172928463.jpg	2025-08-19 08:10:16.595988+00
5fda5f49-0bdb-498b-b2ca-4d4773c2e4d7	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071590-338960206.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:16.714589+00	2025-08-19 08:10:16.714589+00	bg-1755588071590-338960206.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071590-338960206.jpg	2025-08-19 08:10:16.714589+00
e2ee019c-496d-4a07-9b95-5714edb338f9	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071608-51493820.jpeg	\N	\N	all	t	0	upload	2025-08-19 08:10:16.84683+00	2025-08-19 08:10:16.84683+00	bg-1755588071608-51493820.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071608-51493820.jpeg	2025-08-19 08:10:16.84683+00
6061c87b-42ac-48d1-9069-c6a3bde11318	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071620-75605307.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:16.963023+00	2025-08-19 08:10:16.963023+00	bg-1755588071620-75605307.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071620-75605307.jpg	2025-08-19 08:10:16.963023+00
d08bbf6c-e232-47e3-a81a-28c825ce1445	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071635-265524669.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:17.07737+00	2025-08-19 08:10:17.07737+00	bg-1755588071635-265524669.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071635-265524669.jpg	2025-08-19 08:10:17.07737+00
b1eddd6d-147f-4a39-b6ef-d53927334442	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071649-707435357.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:17.19866+00	2025-08-19 08:10:17.19866+00	bg-1755588071649-707435357.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071649-707435357.jpg	2025-08-19 08:10:17.19866+00
57007d83-cf21-488a-a4ac-d3dfdf48c3e5	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071661-885925660.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:17.316539+00	2025-08-19 08:10:17.316539+00	bg-1755588071661-885925660.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071661-885925660.jpg	2025-08-19 08:10:17.316539+00
1b07bf3b-736f-461e-8984-d759f40dd3c3	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071673-913392155.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:17.442149+00	2025-08-19 08:10:17.442149+00	bg-1755588071673-913392155.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755588071673-913392155.jpg	2025-08-19 08:10:17.442149+00
d02a03c6-fe44-44f6-b531-44bd91af7f7c	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026633-565327646.jpeg	\N	\N	all	t	0	upload	2025-08-19 08:10:17.559518+00	2025-08-19 08:10:17.559518+00	bg-1755589026633-565327646.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026633-565327646.jpeg	2025-08-19 08:10:17.559518+00
e897eb37-f1b3-47bf-8973-29f49e6a27bf	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026651-894055387.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:17.91428+00	2025-08-19 08:10:17.91428+00	bg-1755589026651-894055387.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026651-894055387.jpg	2025-08-19 08:10:17.91428+00
6822167a-d873-4d3a-a684-19335982f41a	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026665-152967253.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.031252+00	2025-08-19 08:10:18.031252+00	bg-1755589026665-152967253.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026665-152967253.jpg	2025-08-19 08:10:18.031252+00
46b7f866-350a-41d9-84f3-7fa42a1a8b28	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026686-408116778.jpeg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.143365+00	2025-08-19 08:10:18.143365+00	bg-1755589026686-408116778.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026686-408116778.jpeg	2025-08-19 08:10:18.143365+00
69489e3b-8acd-4ac6-80a7-18836e735ace	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026700-86668652.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.250519+00	2025-08-19 08:10:18.250519+00	bg-1755589026700-86668652.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026700-86668652.jpg	2025-08-19 08:10:18.250519+00
dd9f215f-37d3-440e-a830-eeea33ecc543	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026716-688822842.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.361383+00	2025-08-19 08:10:18.361383+00	bg-1755589026716-688822842.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026716-688822842.jpg	2025-08-19 08:10:18.361383+00
e1bfc28a-f2c9-43e0-bdeb-197616d323c2	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026730-743524801.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.474572+00	2025-08-19 08:10:18.474572+00	bg-1755589026730-743524801.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026730-743524801.jpg	2025-08-19 08:10:18.474572+00
ab143f87-1b10-4df9-b35d-988f1201432b	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026744-781812283.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.588548+00	2025-08-19 08:10:18.588548+00	bg-1755589026744-781812283.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026744-781812283.jpg	2025-08-19 08:10:18.588548+00
5b07547a-59f6-4c83-9e3b-4a4d5009cdb2	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026758-759335959.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.700229+00	2025-08-19 08:10:18.700229+00	bg-1755589026758-759335959.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755589026758-759335959.jpg	2025-08-19 08:10:18.700229+00
5cfb56d1-e76d-4b6b-87c9-a698f03b856f	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937533-275978786.jpeg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.810937+00	2025-08-19 08:10:18.810937+00	bg-1755590937533-275978786.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937533-275978786.jpeg	2025-08-19 08:10:18.810937+00
c313108d-a34b-42ac-b8b6-8f1a4af88dda	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937553-654609361.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:18.923429+00	2025-08-19 08:10:18.923429+00	bg-1755590937553-654609361.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937553-654609361.jpg	2025-08-19 08:10:18.923429+00
46b4cc02-a117-4a3f-887d-f4c9f383bf5d	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937566-221528512.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:19.02735+00	2025-08-19 08:10:19.02735+00	bg-1755590937566-221528512.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937566-221528512.jpg	2025-08-19 08:10:19.02735+00
77133bc4-5d1b-4b5b-baf3-4c5b4434b7e7	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937585-789277951.jpeg	\N	\N	all	t	0	upload	2025-08-19 08:10:19.139005+00	2025-08-19 08:10:19.139005+00	bg-1755590937585-789277951.jpeg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937585-789277951.jpeg	2025-08-19 08:10:19.139005+00
370a27a0-c1b9-4d2c-90f9-f5e6c52fbf5a	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937592-771713521.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:19.24388+00	2025-08-19 08:10:19.24388+00	bg-1755590937592-771713521.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937592-771713521.jpg	2025-08-19 08:10:19.24388+00
42f17724-b951-4eb7-afb3-ebbc32082679	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937603-459617195.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:19.349944+00	2025-08-19 08:10:19.349944+00	bg-1755590937603-459617195.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937603-459617195.jpg	2025-08-19 08:10:19.349944+00
3f743bd3-f1a2-4907-b584-404b562eed51	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937611-68382219.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:19.466273+00	2025-08-19 08:10:19.466273+00	bg-1755590937611-68382219.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937611-68382219.jpg	2025-08-19 08:10:19.466273+00
70e7ae3d-1b79-420c-808d-0576863ddad0	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937618-642353863.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:19.589697+00	2025-08-19 08:10:19.589697+00	bg-1755590937618-642353863.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937618-642353863.jpg	2025-08-19 08:10:19.589697+00
4241fbe9-03d9-425e-bb66-31b48febf97f	41059600-402d-434e-9b34-2b4821f6e3a4	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937625-775354797.jpg	\N	\N	all	t	0	upload	2025-08-19 08:10:19.709858+00	2025-08-19 08:10:19.709858+00	bg-1755590937625-775354797.jpg	/uploads/backgrounds/41059600-402d-434e-9b34-2b4821f6e3a4/bg-1755590937625-775354797.jpg	2025-08-19 08:10:19.709858+00
\.


--
-- Data for Name: configuration_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuration_profiles (id, property_id, name, description, profile_type, profile_uuid, profile_content, is_active, is_default, created_at, updated_at) FROM stdin;
6c3cc147-3e43-42d8-b293-09b2accd4dea	41059600-402d-434e-9b34-2b4821f6e3a4	Default Kiosk Mode	Standard kiosk mode configuration for guest rooms	kiosk	com.chaletmoments.kiosk.default	{"mode": "autonomous", "enabled": true, "homeApp": "com.chaletmoments.hospitality", "autoReturn": true, "allowedApps": [{"name": "Netflix", "enabled": true, "bundleId": "com.netflix.Netflix"}, {"name": "YouTube", "enabled": true, "bundleId": "com.google.ios.youtube"}, {"name": "Spotify", "enabled": true, "bundleId": "com.spotify.client"}, {"name": "Disney+", "enabled": true, "bundleId": "com.disney.disneyplus"}], "returnTimeout": 1800}	t	f	2025-08-19 10:38:30.409388	2025-08-19 10:38:30.409388
b6c6784e-098b-40fe-8273-63f485059ab2	41059600-402d-434e-9b34-2b4821f6e3a4	Guest Restrictions	Standard restrictions for guest devices	restrictions	com.chaletmoments.restrictions.guest	{"disableAirPlay": false, "disableAutoLock": true, "disableAppRemoval": true, "disableEraseContent": true, "disableInAppPurchases": true, "forceAutomaticDateAndTime": true, "disableAccountModification": true, "disablePasswordModification": true}	t	f	2025-08-19 10:38:30.41062	2025-08-19 10:38:30.41062
\.


--
-- Data for Name: device_profile_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device_profile_assignments (id, device_id, profile_id, assigned_at, installed_at, status, error_message) FROM stdin;
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.devices (id, property_id, device_name, device_type, mac_address, ip_address, last_seen, software_version, is_online, settings, created_at, updated_at, identifier, serial_number, model, os_version, app_version, is_active, is_primary, metadata, push_token, last_connected, last_ip_address, supervised, enrollment_status, enrollment_date, provisional_period_end, mdm_profile_uuid, configuration_profiles, kiosk_mode_enabled, kiosk_mode_config, allowed_apps, restrictions, last_command_sent, last_command_status, pending_commands, command_history, room_number, device_status, last_heartbeat, battery_level, storage_available, storage_total) FROM stdin;
9f724aaa-295f-4736-b38a-a226441279ff	41059600-402d-434e-9b34-2b4821f6e3a4	Living Room Apple TV	apple_tv	\N	\N	2025-08-19 10:31:53.972217+00	\N	f	\N	2025-08-19 10:31:53.972217+00	2025-08-19 11:48:37.250148+00	00008110-000439023C63801E	MW1R9ND9G1	Apple TV 4K (3rd generation)	\N	\N	t	t	{"hdr": true, "storage": "128GB", "generation": "3rd", "resolution": "4K"}	\N	\N	\N	f	enrolled	2025-08-19 10:52:12.959495	2025-09-18 10:52:12.959495	\N	[]	t	{"mode": "autonomous", "enabled": true, "autoReturn": true, "returnTimeout": 1800}	[{"name": "Netflix", "enabled": true, "bundleId": "com.netflix.Netflix"}, {"name": "YouTube", "enabled": true, "bundleId": "com.google.ios.youtube"}, {"name": "Spotify", "enabled": true, "bundleId": "com.spotify.client"}]	{"disableAirPlay": false, "disableAutoLock": true, "disableAppRemoval": true}	2025-08-19 11:48:37.250148	EnableKioskMode	[]	[]	Living Room	online	\N	\N	\N	\N
\.


--
-- Data for Name: dining_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dining_options (id, external_id, name_de, name_en, category, location_area, street_address, postal_code, city, altitude_m, phone, website, email, hours_winter, hours_summer, cuisine_type, price_range, capacity_indoor, capacity_outdoor, capacity_total, awards, accessibility, parking, family_friendly, vegetarian, vegan, gluten_free, reservations_required, season_recommendation, relevance_status, image_url, latitude, longitude, is_active, created_at, updated_at, last_imported) FROM stdin;
\.


--
-- Data for Name: dining_places; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dining_places (id, property_id, name, description, cuisine_type, price_range, image_url, website, phone, reservation_url, reservation_required, is_active, created_at, updated_at, name_de, name_en, category, location_area, street_address, postal_code, city, altitude_m, email, hours_winter, hours_summer, capacity_indoor, capacity_outdoor, capacity_total, awards, accessibility, parking, family_friendly, vegetarian, vegan, gluten_free, reservations_required, season_recommendation, relevance_status, latitude, longitude, opening_hours, rating, tags, is_featured, atmosphere, event_type, target_guest_types, access_by_car, access_by_cable_car, access_by_hiking, access_by_bike, access_by_lift, access_by_public_transport, access_difficulty, access_time_minutes, access_notes, location, external_id) FROM stdin;
589bf4b0-9334-40f6-8dca-63b44c9fc02a	\N	\N	\N	Italian	$$	https://media.schafalm.at/gallery/stone-oven-pizza-terrace.jpg	https://schafalm.at	NULL	\N	f	t	2025-08-19 15:54:20.331069+00	2025-08-19 15:54:20.331069+00	Schafalm	Schafalm	Mountain_Hut	Planai	Planai	8970	Schladming	1800	\N	Ski_Season	Year_Round	80	100	180	\N	Cable_Car,Hike	f	t	t	t	t	f	Year_Round	Highly_Recommended	47.37920000	13.67700000	\N	\N	\N	f	Mountain_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	007
68ac0d11-eae4-48ed-9e08-6895a75f81cf	\N	\N	\N	Austrian	2	\N	test.at	+43 123	\N	f	f	2025-08-19 11:55:27.982944+00	2025-08-19 11:55:27.982944+00	Test DE	Test EN	Restaurant	Town_Center	123 Main St	8970	Schladming	750	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	f	f	f	f	f	\N	\N	\N	\N	\N
4f56fd05-924c-4383-9140-0c1546e2ef66	\N	\N	\N	Mountain Hut	2	https://www.schladmingerhuette.at/media/img/huette/weblication/wThumbnails/5e07b551-1276ec79-mh1748@1728w2x.webp	https://schladmingerhuette.at	NULL	\N	f	t	2025-08-19 15:54:20.329959+00	2025-08-19 15:54:20.329959+00	Schladminger Hütte	Schladminger Hütte	Mountain_Hut	Planai_Summit	Planai Gipfel	8970	Schladming	1830	\N	Ski_Season	Ski_Season	100	150	250	Genuss_Specht	Cable_Car	f	t	t	f	f	f	Winter_Primary	Popular	47.37890000	13.67640000	\N	\N	\N	f	casual		{families}	f	t	f	f	f	f	easy	\N		\N	006
60e95d83-867f-4704-8d9e-d001a2a6aca5	\N	\N	\N	Austrian	$$	https://media.reiteralm.at/huetten/gasselhoeh-lake-view-summer.jpg	https://gasselhoehhuette.at	+43 664 45 13 435	\N	f	t	2025-08-19 15:54:20.3345+00	2025-08-19 15:54:20.3345+00	Gasselhöh Hütte	Gasselhöh Hütte	Mountain_Hut	Reiteralm	Reiteralm	8973	Pichl	1750	\N	Ski_Season	Summer_Season	50	60	110	\N	Cable_Car,Hike	f	t	t	f	f	f	Year_Round	Recommended	47.34560000	13.62340000	\N	\N	\N	f	Mountain_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	011
b5e6fa1d-b2be-41bc-8d37-11bf459899e1	\N	JOHANN GENUSSraum	Award-winning fine dining restaurant with modern Styrian cuisine	Austrian	2	https://www.johann-schladming.at/fileadmin/files/Bilder/Hotel/Aussenansicht/Aussen21_02.jpg	https://johann-schladming.at	+43 3687 22571	\N	f	t	2025-08-19 12:00:34.244833+00	2025-08-19 12:00:34.244833+00	JOHANN GENUSSraum	JOHANN GENUSSraum Restaurant	Fine_Dining	Town_Center	Hauptplatz 10	8970	Schladming	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	t	t	f	Year_Round	Recommended	\N	\N	\N	\N	\N	t	casual		{}	t	f	f	f	f	f	easy	\N		\N	\N
aef0b5bb-339b-4e18-91e4-ce7dc51a3dcc	\N	\N	\N	Austrian	$$	https://cdn.schladming-dachstein.at/stadtbraeu/exterior-courtyard-summer.jpg	https://stadtbraeu-schladming.at	+43 664 517 96 20	\N	f	t	2025-08-19 15:54:20.316133+00	2025-08-19 15:54:20.316133+00	Stadtbräu Schladming	Stadtbräu Schladming	Restaurant	Town_Center	Siedergasse 89	8970	Schladming	750	\N	Daily 11:00-22:30	Daily 11:30-20:30	88	60	148	\N	Walk,Car	t	t	t	f	f	f	Year_Round	Popular	47.39470000	13.68750000	\N	\N	\N	f	Restaurant	\N	{families,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	001
bc50524b-8b6b-4138-b68a-b34ff732756e	\N	\N	\N	International	$$$$	https://images.falstaff.com/tischlerei/modern-dining-room-2024.jpg	https://dietischlerei.co.at	+43 3687 22192	\N	f	t	2025-08-19 15:54:20.326353+00	2025-08-19 15:54:20.326353+00	Die Tischlerei	Restaurant die tischlerei	Fine_Dining	Town_Center	Roseggerstraße 676	8970	Schladming	750	\N	Varies	Varies	50	20	70	90_Falstaff	Walk,Car	t	f	t	t	t	t	Year_Round	Highly_Recommended	47.39550000	13.68900000	\N	\N	\N	f	Fine_Dining	\N	{couples,business}	f	f	f	f	f	f	\N	\N	\N	\N	003
ab3d2b46-71d7-47ad-8e0c-445a04749459	\N	\N	\N	Mediterranean	$$$	https://cdn.das-friedrich.at/restaurant/mediterranean-terrace-view.jpg	https://das-friedrich.at	NULL	\N	f	t	2025-08-19 15:54:20.327725+00	2025-08-19 15:54:20.327725+00	Das Friedrich	Restaurant das Friedrich	Restaurant	Town_Center	Stadtzentrum	8970	Schladming	750	\N	Daily	Daily	80	40	120	\N	Walk,Car	t	f	t	t	t	f	Year_Round	Recommended	47.39450000	13.68730000	\N	\N	\N	f	Restaurant	\N	{}	f	f	f	f	f	f	\N	\N	\N	\N	004
24e0134d-664a-4be1-88e5-e50ef8f690cf	\N	\N	\N	International	$$	https://media.artisan-schladming.at/cafe/bakery-interior-books-games.jpg	https://artisan-schladming.at	+43 3687 23038	\N	f	t	2025-08-19 15:54:20.329086+00	2025-08-19 15:54:20.329086+00	ARTiSAN	ARTiSAN Café.Restaurant	Cafe_Bakery	Town_Center	Erzherzog Johann Straße 248A	8970	Schladming	750	\N	Mon-Fri 8:00-15:00, Sat 8:00-12:00	Mon-Fri 8:00-15:00, Sat 8:00-12:00	40	20	60	\N	Walk,Car	t	t	t	t	t	f	Year_Round	Popular	47.39600000	13.68850000	\N	\N	\N	f	Cafe_Bakery	\N	{families,couples,solo_travelers,seniors,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	005
5a618854-b082-4489-b564-832c434744f0	\N	Stadtbräu Schladming	Traditional Austrian brewery restaurant with local specialties	Italian	€€	\N	\N	\N	\N	f	f	2025-08-19 12:00:34.244833+00	2025-08-19 12:00:34.244833+00	\N	Test Restaurant Updated	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dbe5a17b-e6f6-4bfd-b6e3-15a3a2c30851	\N	Die Tischlerei	Creative fusion cuisine combining Austrian, European and Asian influences	Austrian	4	https://dietischlerei.co.at/site/assets/files/1/dietischlerei_0001.700x1080.png	https://dietischlerei.co.at	+43 3687 22192	\N	f	t	2025-08-19 12:00:34.244833+00	2025-08-19 12:00:34.244833+00	Die Tischlerei	Restaurant die tischlerei	Fine_Dining	Town_Center	Roseggerstraße 676	8970	Schladming	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	f	t	t	t	t	Year_Round	Recommended	\N	\N	\N	\N	\N	f	casual		{families,boys_weekend,couples,girls_weekend}	t	f	f	f	f	f	easy	\N		\N	\N
894029d4-643f-4e77-a9b5-13d2ca106e88	\N	\N	\N	Mountain Hut	2	https://www.hochwurzen.at/wp-content/uploads/2021/08/hochwurzen_huette_internet.jpg	https://hochwurzen.at	+43 3687 61177	\N	f	t	2025-08-19 15:54:20.333672+00	2025-08-19 15:54:20.333672+00	Hochwurzenhütte	Hochwurzenhütte	Mountain_Hut	Hochwurzen_Summit	Hochwurzen Gipfel	8971	Rohrmoos	1852	\N	Ski_Season	Ski_Season	60	80	140	\N	Cable_Car,Hike	f	t	t	f	f	f	Year_Round	Highly_Recommended	47.36580000	13.71230000	\N	\N	\N	f	casual		{}	f	f	f	f	f	f	easy	\N		\N	010
e37b6b95-2b55-46a2-9b89-0aa4436c0f3b	\N	\N	\N	Austrian	2	https://www.platzhirsch.cc/wp-content/uploads/2014/12/platzhirsch-alm_og.jpg	https://platzhirsch.cc	+43 664 18 41 514	\N	f	t	2025-08-19 15:54:20.332811+00	2025-08-19 15:54:20.332811+00	Platzhirsch Alm	Platzhirsch Alm	Apres_Ski	Planai_Base	Coburgstraße 626	8970	Schladming	800	\N	Ski_Season	Ski_Season	200	150	350	\N	Walk,Car	t	f	t	f	f	f	Winter_Primary	Must_See	47.38950000	13.68320000	\N	\N	\N	f	casual		{}	f	f	f	f	f	f	easy	\N		\N	009
ffcdcf4a-e474-4e73-a77f-ca37ad5b30d9	\N	\N	\N	Mountain Hut	2	https://www.die-sonnenalm.at/wp-content/uploads/2016/03/Sonnenalm-Logo-300x68.png	https://die-sonnenalm.at	NULL	\N	f	t	2025-08-19 15:54:20.337744+00	2025-08-19 15:54:20.337744+00	Sonnenalm	Die Sonnenalm	Alpine_Hut	Rittisberg	Ramsau am Dachstein	8972	Ramsau	1350	\N	Ski_Season	Ski_Season	60	80	140	\N	Cable_Car,Hike	f	t	t	f	f	f	Year_Round	Popular	47.42340000	13.65670000	\N	\N	\N	f	casual		{}	f	f	t	f	f	f	easy	\N		\N	015
3f8aa7a7-fd0d-4c94-8fe8-ea870e81e0c5	\N	\N	\N	Mountain Hut	2	https://eiblhof.at/files/eiblhof/images/eiblhof/header_eiblhof_neu_2022.jpg	https://eiblhof.at	+43 664 10 44 838	\N	f	t	2025-08-19 15:54:20.336983+00	2025-08-19 15:54:20.336983+00	Eschachalm	Eschachalm	Alpine_Hut	Obertal	Ende Obertalstraße	8971	Schladming	1350	\N	Closed	Closed	40	60	100	Richard_Rauch_Partner	Car,Bike,Bus	t	t	t	t	f	f	Summer_Only	Popular	47.32340000	13.67890000	\N	\N	\N	f	casual		{}	f	f	f	f	f	f	easy	\N		\N	014
ce3501e8-917d-4253-bd5e-be8bb4a53e4c	\N	\N	\N	Austrian	2	https://maerchenwiesenhuette.at/images/huette/huette-01_s.jpg	https://maerchenwiesenhuette.at	+43 664 42 33 823	\N	f	t	2025-08-19 15:54:20.331951+00	2025-08-19 15:54:20.331951+00	Märchenwiesenhütte	Märchenwiesenhütte	Mountain_Hut	Planai_Hopsiland	Märchenwiese	8970	Schladming	1500	\N	Ski_Season	Ski_Season	150	150	300	\N	Cable_Car,Hike	f	t	t	f	f	f	Winter_Primary	Popular	47.38500000	13.68000000	\N	\N	\N	f	casual		{}	f	t	t	f	f	f	easy	\N		\N	008
2c7fc467-8249-4ae0-9c07-436318c713ab	\N	\N	\N	Vegetarian	$	https://cdn.dachstein.at/brandalm/dachstein-backdrop-alpine-hut.jpg	https://brandalm.at	+43 664 1806460	\N	f	t	2025-08-19 15:54:20.338574+00	2025-08-19 15:54:20.338574+00	Brandalm	Brandalm	Alpine_Hut	Dachstein	Fuß des Dachsteins	8972	Ramsau	1600	\N	Closed	Summer_Season	40	50	90	\N	Hike	f	t	t	t	t	f	Summer_Only	Recommended	47.45670000	13.62340000	\N	\N	\N	f	Alpine_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	016
aba2499d-144c-4f7a-8f8c-64a5f8aba7f4	\N	\N	\N	Vegetarian	$$	https://cdn.rohrmoos.at/huetten/onkel-willys-cozy-atmosphere.jpg	\N	NULL	\N	f	t	2025-08-19 15:54:20.354627+00	2025-08-19 15:54:20.354627+00	Onkel Willy's Hütte	Onkel Willy's Hütte	Mountain_Hut	Rohrmoos	Rohrmoos-Untertal	8971	Rohrmoos	1200	\N	Ski_Season	Summer_Season	60	80	140	\N	Cable_Car,Hike	f	t	t	t	t	f	Year_Round	Popular	47.37120000	13.70890000	\N	\N	\N	f	Mountain_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	022
5101cba9-385a-4225-8f08-f36a305a9ec8	\N	\N	\N	Austrian	$$	https://media.planai.at/weitmoosalm/ski-slope-mountain-restaurant.jpg	https://weitmoosalm.at	NULL	\N	f	t	2025-08-19 15:54:20.355596+00	2025-08-19 15:54:20.355596+00	Weitmoosalm	Weitmoosalm	Mountain_Hut	Planai	Planai	8970	Schladming	1650	\N	Ski_Season	Summer_Season	70	90	160	\N	Cable_Car,Hike	f	t	t	f	f	f	Winter_Primary	Recommended	47.38010000	13.67780000	\N	\N	\N	f	Mountain_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	023
e62cfe39-950f-402a-868c-81809d506ff1	\N	\N	\N	Austrian	$$	https://cdn.landalm.at/restaurant/rustic-styrian-dining-hall.jpg	https://landalm.at	+43 3687 61573	\N	f	t	2025-08-19 15:54:20.356386+00	2025-08-19 15:54:20.356386+00	Landalm	Landalm	Restaurant	Untertal	Untertal	8971	Schladming	900	\N	Daily	Daily	90	110	200	\N	Car,Bus	t	t	t	f	f	f	Year_Round	Recommended	47.33670000	13.64780000	\N	\N	\N	f	Restaurant	\N	{families,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	024
b16f1f8a-e42a-4191-9884-570e35aff602	\N	\N	\N	Austrian	$$	https://cdn.alpenverein.at/huetten/ignaz-mattis-giglachsee-refuge.jpg	\N	+43 664 9158589	\N	f	t	2025-08-19 15:54:20.357232+00	2025-08-19 15:54:20.357232+00	Ignaz-Mattis-Hütte	Ignaz-Mattis-Hütte	Mountain_Refuge	Giglachsee	Giglachsee	8971	Schladming	1986	\N	Closed_Winter	June-October	45	30	75	Alpine_Club	Hike_Only	f	f	t	f	f	t	Summer_Only	Worth_Visiting	47.27890000	13.62340000	\N	\N	\N	f	Mountain_Refuge	\N	{young_adults,families}	f	f	f	f	f	f	\N	\N	\N	\N	025
cc30f745-5531-4670-a4a3-4a9b4d489b14	\N	\N	\N	BBQ	$$	https://cdn.planai.at/sattelberghuette/sunny-terrace-bbq-smoke.jpg	https://sattelberghuette.at	+43 676 7506365	\N	f	t	2025-08-19 15:54:20.359418+00	2025-08-19 15:54:20.359418+00	Sattelberghütte	Sattelberghütte	Mountain_Hut	Planai	Planai Mittelstation	8970	Schladming	1670	\N	Ski_Season	Summer_Season	60	100	160	\N	Cable_Car,Hike	f	t	t	f	f	f	Year_Round	Popular	47.38120000	13.67890000	\N	\N	\N	f	Mountain_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	028
a2ba2294-33bf-423d-9e67-c2bec2d5da66	\N	\N	\N	International	$$$	https://media.planai.at/planaihof/modern-mountain-restaurant-view.jpg	https://planaihof.at	+43 3687 22042	\N	f	t	2025-08-19 15:54:20.3601+00	2025-08-19 15:54:20.3601+00	Planaihof	Planaihof	Mountain_Restaurant	Planai	Planai Bergstation	8970	Schladming	1800	\N	Ski_Season	Summer_Season	120	180	300	\N	Cable_Car	f	t	t	t	t	f	Year_Round	Highly_Recommended	47.37950000	13.67720000	\N	\N	\N	f	Mountain_Restaurant	\N	{families}	f	f	f	f	f	f	\N	\N	\N	\N	029
e1e27903-23bb-415b-a28e-796ec4553956	\N	\N	\N	Austrian	$$	https://cdn.fastenberg.at/scharfetter/traditional-mountain-inn.jpg	https://berggasthof-scharfetter.at	+43 3687 22264	\N	f	t	2025-08-19 15:54:20.360752+00	2025-08-19 15:54:20.360752+00	Berggasthof Scharfetter	Scharfetter	Mountain_Inn	Planai	Fastenberg	8970	Schladming	1100	\N	Closed	May-October, Daily 9:00-19:00	70	90	160	\N	Car,Hike	t	t	t	f	f	f	Summer_Primary	Recommended	47.37230000	13.68120000	\N	\N	\N	f	Mountain_Inn	\N	{families,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	030
57bd20da-796c-4545-8312-38c589f8eec2	\N	\N	\N	Austrian	$	https://media.preuneggtal.at/ursprungalm/alpine-dairy-farm-authentic.jpg	https://ursprungalm.at	+43 664 9184522	\N	f	t	2025-08-19 15:54:20.361494+00	2025-08-19 15:54:20.361494+00	Ursprungalm	Ursprungalm	Alpine_Hut	Preuneggtal	Preuneggtal	8971	Schladming	1600	\N	Closed	June-September, 10:00-18:00	30	50	80	Alpine_Cheese_Award	Car_Toll,Hike	t	t	t	f	f	f	Summer_Only	Must_See	47.30450000	13.72340000	\N	\N	\N	f	Alpine_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	031
0f33f558-5f7e-4935-98e7-43ec399d27a7	\N	\N	\N	Cafe	$	https://media.obertal.at/hopfriesen/small-traditional-hut.jpg	\N	+43 664 1234567	\N	f	t	2025-08-19 15:54:20.363232+00	2025-08-19 15:54:20.363232+00	Hopfriesen Hütte	Hopfriesen Hütte	Mountain_Hut	Obertal	Hopfriesen	8971	Schladming	1340	\N	Closed	June-September, 10:00-17:00	25	40	65	\N	Hike	f	t	t	f	f	f	Summer_Only	Worth_Visiting	47.32010000	13.68890000	\N	\N	\N	f	Mountain_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	033
a6e0bd35-f2d2-4f5c-855f-fcd00f73745d	\N	\N	\N	Austrian	$$	https://cdn.hochwurzen.at/anderl/comfort-food-mountain-hut.jpg	https://anderl-huette.at	+43 664 3456789	\N	f	t	2025-08-19 15:54:20.363995+00	2025-08-19 15:54:20.363995+00	Anderl Hütte	Anderl-Hütte	Mountain_Hut	Hochwurzen	Hochwurzen	8971	Rohrmoos	1420	\N	Ski_Season	Summer_Season	55	75	130	\N	Cable_Car,Hike	f	t	t	t	f	f	Year_Round	Popular	47.36890000	13.71450000	\N	\N	\N	f	Mountain_Hut	\N	{families,couples,solo_travelers,young_adults}	f	f	f	f	f	f	\N	\N	\N	\N	034
bcac6018-c491-456e-9913-80dd84c4847b	\N	\N	\N	Mountain Hut	2	https://www.simonbauer.at/files/simonbauer/images/laerchbodenalm/web_laerchbodenalm_sonnig4.jpg	https://laerchbodenalm.at	+43 664 2141429	\N	f	t	2025-08-19 15:54:20.358687+00	2025-08-19 15:54:20.358687+00	Lärchbodenalm	Lärchbodenalm	Alpine_Hut	Untertal	Untertal	8971	Schladming	1420	\N	Closed	Closed	40	60	100	\N	Hike,E-Bike	t	t	t	t	f	f	Summer_Only	Must_See	47.32890000	13.65230000	\N	\N	\N	f	casual		{boys_weekend,families,groups,seniors,girls_weekend,party_goers,couples,solo_travelers,young_adults}	f	f	t	f	f	f	easy	\N		\N	027
d56062c8-3eb5-4f2c-80ae-f8d1b603e171	\N	\N	\N	Austrian	2	https://waldhaeuslalm.at/media/img/slides/allgemein/weblication/wThumbnails/b1451375-3cc42c54@1511w.jpg	https://waldhaeuslalm.at	+43 3687 22177	\N	f	t	2025-08-19 15:54:20.347949+00	2025-08-19 15:54:20.347949+00	Waldhäuslalm	Waldhäuslalm	Alpine_Hut	Untertal	Untertal	8971	Schladming	1100	\N	Daily	Daily	120	150	270	\N	Car,Hike,Bus	t	t	t	f	f	f	Summer_Primary	Must_See	47.33450000	13.64560000	\N	\N	\N	f	casual		{families}	t	f	f	f	f	f	easy	\N		\N	020
64e834fc-0603-4e49-9fb4-6487a9444052	\N	\N	\N	Mountain Hut	2	https://www.moarhofalm.at/wp-content/uploads/slider/cache/b43c34dc6e4c96ea6800f5cb8927289a/IMG_9094.jpg	https://moarhofalm.at	+43 664 4535878	\N	f	t	2025-08-19 15:54:20.358029+00	2025-08-19 15:54:20.358029+00	Moarhofalm	Moarhofalm	Alpine_Hut	Obertal	Hopfriesen	8971	Schladming	1520	\N	Closed	Closed	45	80	125	Bio_Certified	Hike,Bike	t	t	t	t	t	f	Summer_Only	Must_See	47.31560000	13.69010000	\N	\N	\N	f	casual		{}	f	f	f	f	f	f	easy	\N		\N	026
27487ce2-b6f5-4c59-846b-bb74226cc063	\N	\N	\N	Austrian	2	https://www.neualm.at/wp-content/uploads/2018/04/Speisen_Startseite_7.png	https://neualm.at	+43 3687 81776	\N	f	t	2025-08-19 15:54:20.362365+00	2025-08-19 15:54:20.362365+00	Neualm	Neualm	Alpine_Hut	Dachstein	Ramsau	8972	Ramsau	1308	\N	Winter_Weekends	Winter_Weekends	50	70	120	\N	Hike,Ski_Tour	f	t	t	f	f	f	Summer_Primary	Recommended	47.41230000	13.64560000	\N	\N	\N	f	casual		{}	f	f	f	f	f	f	easy	\N		\N	032
fa97a20a-5712-498a-81c2-f2c337d662bf	\N	\N	\N	Austrian	2	https://www.tenne.com/fileadmin/_processed_/a/5/csm_tenne-schladming-startseite_a01951ab05.jpg	https://tenne.com	+43 3687 22100	\N	f	t	2025-08-19 15:54:20.340302+00	2025-08-19 15:54:20.340302+00	Hohenhaus Tenne	Hohenhaus Tenne	Apres_Ski_Mega	Planai_Base	Coburgstraße 512	8970	Schladming	800	\N	Ski_Season_Extended	Ski_Season_Extended	96	60	3000	Europes_Largest	Walk,Car,Bus	t	f	t	f	f	f	Winter_Primary	Must_See	47.39010000	13.68450000	\N	\N	\N	f	casual		{}	f	f	f	f	f	f	easy	\N		\N	018
e92e4102-6022-4271-be48-f0afc47c34df	\N	\N	\N	Modern European	$$$	https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80	\N	+43 3687 61493	\N	f	t	2025-08-19 15:54:20.339511+00	2025-08-19 15:54:20.339511+00	ARX Restaurant	ARX Restaurant	Fine_Dining	Rohrmoos	Rohrmoosstraße 91	8971	Rohrmoos	900	\N	Wed-Sat 15:00-22:30	Wed-Sat 15:00-22:30	45	20	65	1_Gault_Millau	Car	t	f	t	t	t	t	Year_Round	Highly_Recommended	47.37650000	13.70120000	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	017
027a3d84-e4dd-4e1a-b433-b0b07fb0d382	\N	\N	\N	Mountain Hut	2	https://static.wixstatic.com/media/0d8ce4_2919ed0e63a94dcd95851c7d4aeab2c2~mv2.jpg/v1/fill/w_2500,h_3333,al_c/0d8ce4_2919ed0e63a94dcd95851c7d4aeab2c2~mv2.jpg	https://krummholzhuette.at	+43 3686 2317	\N	f	t	2025-08-19 15:54:20.335212+00	2025-08-19 15:54:20.335212+00	Krummholzhütte	Krummholzhütte	Gourmet_Hut	Hauser_Kaibling	Hauser Kaibling	8967	Haus	1857	\N	Ski_Season	Ski_Season	80	100	180	1_GenussHütte	Cable_Car	f	f	t	t	t	f	Winter_Primary	Must_See	47.41230000	13.74560000	\N	\N	\N	f	casual		{}	f	f	f	f	f	f	easy	\N		\N	012
bf35a395-802e-4f2d-872a-6e544e70b093	\N	\N	\N	Modern Austrian	$$$	https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80	https://hochsitz-hochwurzen.at	+43 3687 61188	\N	f	f	2025-08-19 15:54:20.364704+00	2025-08-19 15:54:20.364704+00	Hochsitz	Hochsitz	Mountain_Restaurant	Hochwurzen	Hochwurzen Mittelstation	8971	Rohrmoos	1300	\N	Ski_Season	Closed	90	120	210	Design_Award	Cable_Car	f	f	t	t	t	f	Winter_Only	Highly_Recommended	47.36750000	13.71340000	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	035
6166faf6-f6c0-441a-b744-837dceb9b471	\N	\N	\N	Austrian	2	https://www.johann-schladming.at/fileadmin/files/_Upload/AlmArenA__c_Josh_Absenger__3_.jpg	https://almarena.at	+43 3686 20060	\N	f	t	2025-08-19 15:54:20.336199+00	2025-08-19 15:54:20.336199+00	AlmArenA	AlmArenA	Apres_Ski	Hauser_Kaibling_Base	Talstation Hauser Kaibling	8967	Haus	750	\N	Ski_Season	Ski_Season	800	700	1500	\N	Walk,Car	t	f	t	t	t	f	Winter_Only	Highly_Recommended	47.40980000	13.74230000	\N	\N	\N	f	casual		{party_goers}	f	f	f	f	f	f	easy	\N		\N	013
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, external_id, name, description, location, start_date, end_date, image_url, source_url, category, is_featured, is_active, price_info, contact_info, created_at, updated_at) FROM stdin;
45	schladming_ev_24924660	BREEMA Harmony Bodywork und Zen Meditation	Einzetraining ab 80€ *monatliche Beitragszahlung\n\n\n\tpersönliche Betreuung\n\tEinzelstunden\n\tinkl. Trainingsplan\n\tinkl. Breema Harmony Bodywork\n\tindividuelle Übungen\n\n\nGruppen Kurse ab 50€ *monatliche Beitragszahlung\n\n\n\tmax 10. Teilnehmer\n\ttägliche Kurse\n\tzertifizierte Trainer\n\tfür Einsteiger geeignet\n\tinkl. Meditationsübungen\n\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Öblarn","postalCode":"8960","streetAddress":"Öblarn 311c","email":"info@psychosozialeberatung.org"}	2025-08-29 11:10:25.858	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NCIgdmlld0JveD0iMCAwIDQwMCAyNjQiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUlBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNrUUFRRUJBQUlCQkFFRUFnSURBQUFBQUFBQkVTRXhRUUpSWVhHQkVwR3g4S0hCSXVFeVF0SC94QUFXQVFFQkFRQUFBQUFBQUFBQUFBQUFBQUFBQVFML3hBQVdFUUVCQVFBQUFBQUFBQUFBQUFBQUFBQUFBUkgvMmdBTUF3RUFBaEVERVFBL0FNQUFBQUFBQUFBQUFBQUFBQUNvQUFBQUFzUUJ2SVgwa3UvYlc0aXVlY25EVnJLb0l2MnVBY1o5cngrZjcybXBiNGdJZ3VBZ3VBQUFBQUNLQWdvQ0FBQUFBQW9BQ29BcUtBZ0FBQUFBQUFBQUFBQUFBQUFBQzZuYWdLbVZBWC9Zc251bEJCZXY3L3BBUnFWbFFhU28xd2d6cU5ZV1NLSnFMSnBnQUFBQUFBQUtDWXFvQ0FBQW9DS0FJcUFBQUFBQUFBQUFvSUFBRFVtZk4rQVJjaDEvZktjMEQ2S2RFbEFTUnJvMy9BTDlKYm4ybHAzUVRzQUVGQUYxQUYybWNMK09Tb0lxR2lJSXZ5cWhnMERPRFNBazdhU1JRQ3FJTUFLQ29vQUFDS2dLaWdJS2dBQUtnQUFBQUFOYjE0WkFWcnBnMEdyV2Q1NVJxUUd0bDFtMWJjWkFBQUd1SXoyQUtVRVhhZ0RhSnFvSm5KY1ZMSjJDTGVraTN3b3kxR1ZnTkNvZ0trVUFGQnpBVVVBQkZBQUFBQUVVQVJVQUFBQUFBQUFBQUFYZUVLQUFBRVBJRFVuWHRTUzl4cis0RFA2ZVpDem5qdzM1MDhmelVIT0l0endpZ3U4WWhnSGxjSkcwR1dXckdjQkJSUlpXbUdwVURwZmxEcjZCVk96b0hNRlVBQUVVQVJRQUFFVUFBQVFBQUFBQUFBQWFrMWNCbnFmZjhJMVpxZEFnQUFBT2t5UldmVG41WHUvWGFVVkpmQmxXK21ZU0t6NnQ0NitHYTNtNHhaNThLaVJwbFVGSlVCR3Q5MDZEc1ZMRU1XQWdJbzFxc0tEVTR1ZUswekwrOFhVR1VCUlFBQUFBQUFRRkVVQUVBQUFBQUFBQUIwZ2tYVVZXYm5zdkdhZHhCaW8xZm44TXRJQUFyV3llblBmdGdCMlM4ekdadmpwcEtKUGs5VzlZTlVnNGkzdEZGRUJCWWpVc0ZXeG0wdDU0THp5Z3lBb0FvTDZXNzdzeTg1RnZuNlFZRlJRVUFBQUFBRVZBQUFBQUFBQUFBQUFBYW5Tc3hZaXRaMHFVM1VFKzJXcmZDWW95QXFBQU4rbStMV3Qxem5KTFlEci9BS1o5WFhIOWpNdHR0WHhmcEJpVFN0NSt6Q2dBQUJsb0JMaS9wcGs5d1NvMWs5eko3Z2d1SmxCZlQyMXM1WUFBQVVSUUFBQUFCQUZRQUFBQVVERFBsdTVJek1CRWFzbU02QUtnQ29BNlNjR2ZKc1JsU3hpdHNWWUFDb0FvTmVtY2ZiTjRyWHB2ZzlTRE0vMDZUcHpubHVkVVZQVmZEQlJVRm5wdCtJMWs5UGZOOWt0dEEvNHo1TGF5QUM1VEFRWEo3bVQzQkYybUpsQmVMMlorVUFBQUFBQUFWQUFBQUFBQUFWQUdxazdBVXY4QUtMT1Z3R1FCQW5LMkpBYloyOUwrVTdRV2V5MmYzKyt6TFV1Z3dOV0pKeW9aWWpWak9XQTNQZjhBZjcvN1BWekU5UGx2dEZZamNURkJqTzR2L2o5cmVPZkxDb0lOeVp6ZjJCSk4rSWNUcjk3L0FQQzNVUlMxQUJSRkFOUUJlUHBNVVZFQUFCUVFBQUFBQUFBQUFBQUFBRm5iYkRXenlnVmhxM1dSUVdUWWxtS2dzOTJWQmV5ZG8xRUdoTjhGNDU4ZVFYR2JjWDlVWXUrUWJqVFBwNi9LOUNtdE9kYjZ5QW5xL3dCdWJwWnN4bVFRa3ptL2hOMWF5S29nRFdWbDBsNExKbkNhT1lDZ0FBcUFBQ29LZ0FBQUFBQUFBQUxtdGZwOXdZRzhrVGdHUmVEQVFBQTBBSmNhM1dRRnNSWlZ5VUJMVXpCQmUrLzNiYzJwZkNpV1lqZmJBTnl6RlluOFZkaUJPZlYva3QwbkV0WlVibExlR1lXb29pb0FzNVJ2MCs0TEppLzRaMWQ4SU1JdDdSUlVBQUJRRkJFQUFBQUFBQlFRQUhXY1F0WjlOOE5XSU9hbVo0UUYrVUQ3VVh1ZkxMYzV1enBiNlo3NERtTlgwNThzZ0FBRzRBTjdxV010YURJMG1ld05TNmxtcFBab0dCYkVCci8xKzZ5MTRqSUxFV2VVQUFCZStHdW96TzJtYXA1Vk41VUQ3VGl3TGNCbW91MUZBQUdrRlZFQUFBQXdBQUY4QWlLQU5UMWU3SURweFdNeERhQTFJenZ3YlFkTFo2ZUdmMWU3QURldzJNQU5aS2ZwK1dUUVg5Tk12c2JWMEdScll2SHdETXFxSUlxS0tWaXpHNEtpZUl5MWV2cXNnczhvczdFVkZpQU5UdFdaV3IwbEdmSzdrd1NxTnptTTIrR1FCUUFwNE8xQVFGUlVBQUFBQUFBQUFBeHZNakhZSEF1ZEplUU8rTU1YT1BtSUI1TzFab0xpTHFBQUFBQUM0dGdFclVjK2E2ZW1jY2dubGFVMFU2akxWWnk5QW52RUp3dEVSYWpYajYvaEJrVUZScWRmbGxxRkdzWjlTNmx5b01pOENnQUFLZ0NvS2lvQUFBQUFBQUN6dUlBMzZxeDViN1k1UlZJZC93Q3prQzFNTS83QkYraVNYdEtsN1ViL0FFeE1qSURXUXlNZ05aREUxWmRCVU9mZzg0aWt1TnN5NTN3dEJMVTBxQTJtc3RjS01OVG1mTS9oZGlTOTBRekNMZmZ3SUZqTFdsZ3JDeGNBS3l0QVFBRklqVnZ0d0M4Uk82bmJVQmtCVUFBQUFBQUFBQUFOTmdBc3Z5YUFKZndtZ0FBQ0tBQUFDeXlBQmVldUQrUVFha3p5V3dGVmxBUVZlTzlCUm1kdGNBaUV2aTlBQWxKZkY2QUd0VGdCVXFBQ29DZ3MrUUVYajNOL0FBLy8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/BREEMA-Harmony-Bodywork-und-Zen-Meditation_ev_24924660	wellness	f	t	\N	+43 650 22, 025, 742info@psychosozialeberatung.orgwww.psychosozialeberatung.org, +43 650 22 12 742	2025-08-28 11:08:48.620183	2025-08-28 11:08:48.620183
46	schladming_ev_24221176	Brass Konzert " Schmank5 "	​​​​​​Die Marktgemeinde Gröbming lädt herzlich zum Brass Konzert der "Schmank5&nbsp;" ein.\n\n&nbsp;\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Gröbming","postalCode":"8962","streetAddress":null,"email":"rene.binder@groebming.at"}	2025-08-29 11:10:28.189	\N	https://www.schladming-dachstein.at/Events/Groebminger-Land/Events/05-Mai/image-thumb__2379468__masonry/Stoderplatzl%20NEU%202.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Brass-Konzert-Schmank5_ev_24221176	music	f	t	\N	+43 3685 22150, 025, 22150rene.binder@groebming.atwww.groebming.at, 08.2025	2025-08-28 11:08:48.628957	2025-08-28 11:08:48.628957
47	schladming_ev_22968412	Blasmusik am Kirchplatz mit der Trachenmusikkapelle Ramsau am Dachstein	Ein besonderer Abend voller Musik\n\nDie Trachtenmusikkapelle Ramsau lädt dich herzlich ein, einen unvergesslichen Abend zu verbringen! Ein besonderer Abend voller Musik und Geselligkeit. Erlebe eine abwechslungsreiche Mischung aus traditionellen Märschen und modernen Musikstücken, die sowohl Jung als auch Alt begeistern werden. Genieße die stimmungsvolle Atmosphäre und verbringe einen entspannten Abend in guter Gesellschaft.\n\n&nbsp;\n\nAm 03. Juli um 19.30 Uhr dürfen wir auch den Ramsauer Jugendklang begrüßen. 😍\n&nbsp;\n\nDie Trachtenmusikkapelle Ramsau freut sich darauf, dich bei den Blasmusikabenden begrüßen zu dürfen. Sei dabei und lass uns gemeinsam einen tollen Abend erleben!\n\n&nbsp;\n	Kirchplatz der Evangelischen Ramsau am Dachstein	2025-08-29 11:10:29.985	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjM0NyIgdmlld0JveD0iMCAwIDQwMCAzNDciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRmJBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNjUUFRRUFBZ0lCQXdNRkFRRUFBQUFBQUFBQkVTRXhRWEVDVVlHUndkRmhvYkhoOEJJeS84UUFGUUVCQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUgveEFBV0VRRUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFSSC8yZ0FNQXdFQUFoRURFUUEvQU1LZ2d1Y0FnTmFRQUZBRzUrclRNMWYxYVVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBY1VVUVJadEZVQVdvSXFLRFV1ZE5NeWR0cUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFPQzV5SWdvU2dDOG91d1JZR0FiblBEVE1hVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFjUUVBQUJaMnVFQmZKeGRJQTFHM0pyZmtHeEpudFZBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUhFUVFVUlFYS0FBQUNyTklBNmI5aG5MV1ZGQUFBQUVBVVJRQkFGRUFVQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUhEQUFLZ0FvQ0NLZ0NxeW9OU04vdXpOYmFVVUVBQUFBQVZBQUFBQUFBQlVBVUVCUkZBQUFBQUFBQUFBQUFBQUFBQUFCd0FCYnhOSUFDb0FxQWdxb0EzTnpDeXNHUWJ5U3M1V1hDalFTNUFBQUFBQUFBQUFBQUFFdDByTkJaZEt6NmEwQUFDaUFLQ0FxQUNpQUtBQUFBQ0FvZ0RpQ2dDb2dncUFBQW9BQUlDNVZBRzR2YkVhNUJTSXNVVUVCUUFBQUFBQUFTM0RHYno3cnpkbU9BU055NVlrMjFPZlAyQnBVQVZBQUFBQUFBQUFBRkFRVUFBQnhYcEZpQWlvQWlnSW9BQUFJQUNnQ3F5MUFGMG1FQnNaaXFLcVpUSU5DWk1nb2lnQUF6K1RlejhweUIzOE5UbG52NFdBMEFBQUFBQUtnQUFLSUFvZ0NpQUtJQTVBSUFBQUFDQUFBQ29BS0FBcUFMbnRGQUpwckxDZ3RRQVZBQlkwd0E2RE9USzZNaDhMOEFMTko3K0NBMk1HYURZei8xVXpRZEFBQUFBQUFBUlVVQVF5Q2laQWNWUUJSRlFBQUJGQUVBRlRsYW9JS0FnWXlDZ0lBTGdFQUFWQUZCS0NvTlNjVUZuQ1JldnFrQTcrRTQzMHZkOExZcW9KamVqTjloQmNKbFFhbDFGWmx4YlBsY2cwTTVNZ29tVXpRYVRNWkFheUp0cUF6YWpWaWNBZ3FLTUM0MGlBcUtnZ0FDb3VBRVhHOWxVUlVBQkZBQUJiVUxvQlpXcC82WWFuSU1xdHdZUVFEWUFBRFdlR2Ntd2F6SkRMTklvM295eGxjZzEzVlR1K0QrZ1MvZGI1NVM5ZVM4L1JCUlBWZHBsUnBjUnpYSU42Tk9lVnlEZWpERXBtZzZld3puc3lEVE5YTE4yQWVwRUFsMjB3MGxGUzhDVUNSY1FBTVFGb01pVlZCRlhHSUREVXFBR2tVQUFBYW5GWlgrQWE2dnZ5bXVmci9YNFR2SzRCZjl6L0gzVmpEVUJVcytGQWM4THRheUMxRk1naW5LWUJyUDd0ZjB3MkJldks0Mnpldks1QlBWTnM0dnMxMm51Q2RmS0wyM3I2b01MWVZGQmNFeFl1ZllFQmN5Z2x2U0xtZXhQQUprWDJRR1dvaXdBQkFBQVhPVXE0MG9sNlJxL1pBV1Jid1F2SCs5d1lGUUFBRi9DQUFvb0kxUEtBTFVoTHZaa0drTXM1QmF5dFFBQUE1VklDeHBuSzVRYXZYbEV5dG9GVDJPVlVNVS9scEx6TDhDcDlSb0VZL0NPakZtL2dFSk50ZW5ockFPZHlzNHJlREVCamQrbEpPbThHQWNtbVp1dDRCQmNmcWZLQ0JvMEFpL0FvaERrQnFVdkhrTFFSbHBtZ0lxendETFI4QUFBQkFnQUxqOVlESUFBQUFBQ3BzQlZaRUZYbG5YU3ptS0w5MjVFeCt5Z0NnQUlDc2QzdzB6MkMrbmhVbkRRQ0tBZ0tEbEdpZUlBZ29DQUFKaFFBQUZ5dVdRQktvRE5XY0lRRzBvWGdHYXZSRnZBTXFrNVc4Z2R0WWpMUU1Ya1dzZ3FOUm9HRWIwbEJHdlRMOE10emdGWEU5a3laQm4xUkp6R3JaaEpvR3hNcUNpQUFBQ1ZVb0VhU0FLQUFBRG1BQUFBaWdJS0FpZ0FxQUFKUUlVaTNnRWxXc3hhQk9WU05BeE9XdTBxQTFGU0tDVmhxb0N4VUFDZ0NLQUFBQUFOTk1yQVVBQUFBQUFBQUFBQUdBQUFBQkFCVUFVUlFBQUdXa0FuQzFBQ0ZWQVNjdElvRExTQUtBSUtnQUFBb0NDZ0lLQUFBcW9vS0FBQUFBQUFBQUFBREFBQUFBSUNpS0FBQUFBaW9BcUFLZ0FBQUFBb0FDS2dDb0FvZ0FBQXFLQXFLQXFLQ2dBQUFBQUFBQUFBQXdBQUFBQUFBQUFBQUFpb0FBQUFBQUFBQ2dnQW9DQ2dJS0FpaWdpZ0FBQXFLQ2lBS0lBb2lnQUFBQUlBTWdBQUFBQUFnS0lvQUFBQUFBQUFJQUFvQUFBQW9JS2dBb0FnQUtpZ0FBS2lnQUFBQUFBS2dBQUFBRElBQUlBS0FpZ0FBQUFBQUFJQUFBQUFvQUFLQWlnQUlBS2dBQUNnQUFBcUtBQUFBQUFBQUFBQUFELzJRPT0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Blasmusik-am-Kirchplatz-mit-der-Trachenmusikkapelle-Ramsau-am-Dachstein_ev_22968412	music	f	t	\N	025, 026, Dachsteininfo@tmk-ramsau.atwww.tmk-ramsau.at, dachsteininfo@tmk-ramsau.atwww.tmk-ramsau.at	2025-08-28 11:08:48.630303	2025-08-28 11:08:48.630303
50	schladming_ev_22669947	Schladming-Dachstein Nights | 8 for 80s	Im Sommer verwandelt sich der idyllische Hauptplatz in Irdning zu einer lebendigen Bühne für ein unvergessliches Open-Air-Konzert. An zwei Freitagen,&nbsp;können sich die Besucher bei den Schladming-Dachstein Nights auf einen bunten Mix aus Musik aus verschiedenen Genres freuen.\n\nFrüher bekannt als die „Sommernacht der IRDNINGER Wirte“, erwartet die Gäste auch diesmal ein unterhaltsamer Abend mit Live-Musik, köstlichem Essen und erfrischenden Getränken – alles unter freiem Himmel.\n\n\n\t25.07.2025 mit A.M.S - Die Band\n\t29.08.2025 mit 8&nbsp;for 80s \n\n\n8 for 80s\n\nDie 8 for 80s sind eine Pop-Rock-Formation aus dem Ausseerland,&nbsp;\ndie mit ikonischen Songs der 1980er Jahr- von Tina Turner über Journey, Queen, A-HA bis hin zu Cher, Madonna und Foreigner- begeistern.\nEinzigartig ist die breitgefächerte Besetzung mit mehrstimmigem Gesang, rockigen Gitarren, Synthesizern und sogar Saxophon!\nStilecht 80er Jahre eben. Das Repertoire ist extrem variantenreich und reißt von Jung bis Älter alle mit.&nbsp;\n\nWebsite:&nbsp;www.8for8s.at\n\n\n	Hauptplatz Irdning	2025-08-29 11:10:38.174	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2NiIgdmlld0JveD0iMCAwIDQwMCA1NjYiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBSTJBWkFEQVNJQUFoRUJBeEVCLzhRQUdBQUJBUUVCQVFBQUFBQUFBQUFBQUFBQUFBRUNBd1QveEFBc0VBRUJBUUFCQXdNQ0JRVUJBUUVBQUFBQUFSRXhBaUZCRWxGeFlZRXlRcEhSOEtHeHdlSHhJbEppLzhRQUZnRUJBUUVBQUFBQUFBQUFBQUFBQUFBQUFBRUMvOFFBR2hFQkFRRUJBUUVCQUFBQUFBQUFBQUFBQUFFUlFURWhZZi9hQUF3REFRQUNFUU1SQUQ4QTVnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQTZnSUFBQUFBQUFBQUFNOVhERGZWd3dzQUFBQUFBQUFBQUFBQVhrc3M1QkJaTjRMTE9RUUFBYTlONXhrQUFBWExadmhBQUFBQUFBQUFBQUFBZFFXSUlLZU8vdUNDMDhBZ3ZzQWcxK3g3QXlMKzVRWTZ1R0crcmhoWUFBQUFBQUFBRFhSbXN0ZE0yODREZHRsM21NU2VyZlp2cHR2YXo3ck03eWU5QmowNU5sOHRkVTNPK01aMVQzelcrdng4Z3plbjAyZks5ZmV4ZXJucCtUcW0yZmNHWjB5L203cE9tMjJlenBKbDdUdG5KUHpmSUpQdzNMdkxNNmRtNjEweXpwdjNPajhOQm4wZHRsUFQyMlhXdW44Tis1MC9oL1VFa3ZwNTdZazZkbTYxUHdmcVQ4SDZnemVudHN1bnA3YmJqVS9COXFUdjB6WnZ3RE42Yzc3OE1OOVZ2YnRrUFYvK1lEQXQ3MUFBQUFBQUFkUUVEVFU5ejZndW1vZTRMcHFIc0M2YW5sUDlnMW9rOHFEUFZ3dzMxY01LQUFBQUFBQUFBTlNiMjNBVGI3MDNHdlQzemUvd3paWnlCdDl6YjcxQUYyKzlOdnZTYzkydXFTWmdNN2ZlbTNuZTZBTHQ5NmJmZWttNzlFQmR2dlRiNzFHcjZmVDlRVGI3MDIrOVFCZHZ2WFQ4czlOeXVjbTNuR3IwNU41QmJmL0FEbTdYTnIwek4wdnB6dHlESUxNM3VDRGZWSk14Z0FXek95QUFBNmdJQUFBQUFBQUFBQU05WEREZlZ3d29BQUFvSUFBS0FqWFQrS010ZE5rdTBGNnZ4VDdOZFhqdHZmaExlbTNlL3hpZXJ2dmdHNXZtUkpKTnYxdWZZOVhUdTkrRW5WSmI3WHVDZXFXVDMxdnF1WjhzZjhBbnh2SzJ5NXoyb0wxU2IwNzkxdStKTFBabTNwdWZRbGs4MzQ5Z1hwNHYzVHA3N2JJVHFuZmZOSjFTZStBdmp2bW5WK0hmaG0rbnhxMnpNN2d0djhBNTNKNE9ydjB5L0NXeXpPNWJMTTdneE9aOHV1OTdLNXpON3JiTjJYdUMyWkw4eGVyOE0reVhxbG1Gc3N6dURWN1prN2VVNnIza21jeWx5WnRzK0V2VEpsM3lEVnVXZlZMMjZwOVV0bHN2ZnNYcWxzdnNCMVh2SjQvMjFaZTJabnQ3czI5Tjc5MWxrNDNQWUhPODN4OUVhdDI2Z05teGxERWIyR3hnTVZyMVE5VElZTmVwUFVTR0FlbzB4QVhUVVFGMUFBQUFWQUZzeW8xZWFnQUdBZ3VMMDh3RUZ5MjB6NG9HSTFKa3Zmd25wdmE2Q0RXWDlUTGI0RlpHcy80WUl5TldIVE80ckkxdC9rVEFRYnM3U2ZVeTdKYUl5TG5mdFRMUVFYUE9ucCtxaDZ0NWtxVzJyWmlZSWd1R0FpaWdncG9JWUtDWUFBQ2FLdW1vSUFIa0NvM09MR1FRVkFBQUFBYXZOUlVBVkZuN2lyaXlkeWNLR004Uy9ZbkYrWVdwdWNDTmZsK2FYaWZETzMzTjl3YTh5ZkMrYmZsTlFGbkZMeEUzMmFtZ1h4OEU4L0NYa0E3MHZnMm1ndDhRODFOTkFuSjQrNmFvSGo1THoraUFMZVVMUlVBQUFRQUVBV2NvczVBODBQZEFBd3dVYVpheEJmU1lzTHdweG1Gbm45VWpYMVJXRWFzL1JBQmNBUkdrRVZGdktBcXppc3RUaWlyT0ZKd29NMW1MVUVSUllBMW1vc29NMllxOVNBS0p5QUtBZ0FKeUtBaW9Bbk5XeUhGS3BmRWlvb2lBQUlxQXVXcml6ajRQSDNGWUFFWFVBQjBjM1NvdkF2Q3BlRk9NeFVqVE5hbmlmUmxwTDMrUkVRQUFSUnE4b3FDRFU0ckxVNEZhbkNwT0ZCaW8xV1JGQTRCV3BDY2Fvak43NGwyTlhsaXFIUExUTWFSVHNpZ0ROYVRBckt5bGw5bGsraW9TZGpGRVZQWmVVOHRLakhrSnlVRUFBUmNVQ2RsMzlFUUY1NFpXSUFBaWpwV0kySEZTOEtsNFVaalNSV0sxUEJHa0JtKzdMZkRLb2dvQ2F1MUVWR2xuSDZzeHFjQ3hxY0trNFVHZXBodnFKMGlKQzYxbUZBOFlxVkpxb3ZsS1RuN0xSV2U4V1NxYWdXSW9DSnVyVW5LcFNicm94MHhya0VQSmpOMkNxYkNXOEdCK3MreTFiRjdRUm5MVjlLVyt5QTNlMFpXOEpKdkZCYXkzSjdwUVNjYXl2MDhHQWcxa1N4Rkp5MzVqRTVqZm1CeHBtdE0zZ0VqU2RQQ29xS0lnckY3TnBRWUl1TXFJQXFLMU9QMVphbkFyVTRWSndvTTNscG04cjdLeXFvVzVpS3ozbHhWNVFHZUNYOVMvd0RVa3RVYStRekU4b0t2ZGNNRVk3clBxMWpOaWl6Q1ZuTDNia0FyTmF2djdJbld1RW5CYlpUZlk1VmxDOFFwZUloR0JSUnVwbnN2czBLeldXNnpnbHJOTnRLZ0FDS3M1amQ4TVRtTitZRjhhUzhLbDRCSncwek9Ha1VSUUdWS2lLVnpkUERDeEdWQlVHcHd5MU9CV3B3cVJRWnZKcDFNaU5hYnZMT21nMHVNYTNGRXM3d3ZndFgyQ3MzRHlWQkhWS2FkZ1ZucVhZemFDZUNYRW9pdDdjTWlHeFVJc1kxZEFxM2lKeVhoRlJVMWRWRGNWaHFDVm9TaW9sNVpXOG9qVUFFVlp6Ry9MRTViOGhmR21hMHoxQVRocG1jS2lxZ0FJQ0tsN00wb3NTb0FxRFVaYWdOUlVpaXNkVExYVXlJR0M2Q09rNGMvM2RQQ2pONWFuRERVNEVTOG90NVpCZFRWUUFCRkZpS0Fpb3FBQ0sxT1RaZXlUeXVJcVZGcUxFbzFFSXFOVVM4S3JMUGxGOG9qVUJCRmFuTGM1WW5MZms2WHhwbnE0YVo2dUFZYWxaYWt4RlVCRkVBVm4zUlVhWkFCQnFNckFiaXNyK2dIbm54L245amlaUHQrNjV4L1UzdjhTY2dmM1M5OC9iK3pYOVBoUDE1QVNwbmJtWDVuODdsemdHV3B3blpyWW96ZVVhN1ZNUVNDNFlxSWpTQUFJcUFBZ0tCRlNLS3JLaElscUxPUVZGdkJFT0JEeXl2bEVhQUFhbkxmbGljdEVMNDB6MUxyTnFwcWF2cVpHV210TmpJWWExc05aRERWdktBcUFBQ3hGQnBlN09yTyt3R3UwM3ovQUR1VFA1L2RPOG5mMzVOLzdzQlU1dk4rUGo5MTU5cy96OVA5cGJ5Qy93QlhPOHVsL3Y3OW5PODBCRzUrSDdyZWVyNEJpTkdTWjlsN2JpaUpXOGgyNy9BT2VxMWs3OWl6c0RLTjVQYmxMSkpmbkFaUlVRUllBQUFLQXFJS29BaTZJejVScnlpTklLQXM1WGU2ZGtCclVxSFlBRUJRQlFFQVZGZ2dBQW9nS3ZUdjhtbzEwNUFYUDUvbi9CbmJ4OGZ0OG0vWCsvdWJQcjhndkhIN0p4NTgrMkd6UDlmemcyZjkvdjhBY0YrUDU5bk84MXUyZC9ybjg0WXNBMnIzOStkL29UeDgvd0REOWdUdjcxWmJzMWZQMFN6ajdndHZibjZzNzFmVmM3ejRQdjdBYmZxYnpxL2Z4aDkvTS9vQnRadS9WcjcrYW0vWDJVWkZ1SWdBb0lBQXVvcW9hbXFsQkJSRkJZcXBySVZFVlZ4STBxV3BoaVdpTDlFQUdvMXNZREYxZXpJQUtnSW9BS0FBZHdBN2lnSW9LQXFBR2dCb0pRTk5RUVVScFJNTU5OQlVWQUFCRVVBQUFFQkZBQVZVMVZSbEZvaW8yeXNxcFdSVVJRQUJVQVZGUUFBSG9BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCTGNCUmoxL1JaMVNnMEFBQUFBQUFBQUFKYmlUcTI0RFFsNFRwdG9OQUFBbHVUUVVTWFU5UU5BQUFBQUFBQUFBQUFETjZzdVkwQUFBQUFBQUFBQUFBQTU5WExvNTlYUDJCcVNZeGUxYjZlR0wzb05YcXMvUlBWZnNkWFAyYS9MOWdKZFQxVzNzelBQeFNidllHdlZaY3AxV3k5a3N2bXc2dkh3QjZxMTAzVm40ZnN4MDhnNkRIcHBKbTM2QW5WemlXWlRlK2x1ZzZXOXQrak10dWt2OEE1djBUcDgvQUhxcTlOdHZkT25sdXpZQ3M5WERQcHYwV3pPbjdnenVTL1ZycG5uOUdjN1crelhUZkg2QXQ2czdNNzFIVnpXcndCdXkxbjFVbkYrRHA1K3dIcXM1YXR2aG5xNSt6VzUwd0dmVldwZTIxbVM5VlhxNGdHOVY0V2RXOXF6TjhVa3U4d0Y5VjFQVlUvTjkzVUhLN3ZkcVcrZUU2dVc3eGZnR2ZWYndlcXk1V1p2aGJMNXNCMENBQUFBQUFBQUFDV2FvRG42YXM2YzViQWMrcm43SHByVjZkYUJtVEU5UHRXd0dQVDdyZW5XZ0V6dG4wWm5UWld3QkxObUtBek9uT1ZzVUJpZE5tL1dMT25OYUFZblRaV3dBU3paaWdNeVlsNmUvWnNCbTlPL0tlbSs3WURPWk1KMDQwQXpacVhwdmI0YkFZOU45MW5UMnNyUURIcHZpck9uTzdRREhwdTc5V3dCbTlPcE9teXRnTWVtK0tUcDkyd0FBQUFBQUFBQUFCbTNHbWVxNW5ZRmwyYXJPNUpVOVY5Z2JHSjFiMnJZTStxYmpUbDUrN1Y2c3VBMk1lcjZGNnM3UUdyY0pkWXQyTExrb05qSHEraE9yM0JiMVpXbU9xNWVJdDZzejZnME1lcSt5enEwR2hpOVhzZXErd05pUzdGQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFZNi9EYlBWTGNCbS9oalhUd2xseVJycG1RSFA4MzNkV1BUZDM2dGc1ZWZ1dlZ5dnB1L2N2VGJRYWtqbjUrN3F4ZW52c0JlcmhtZmhwNmJWeTVZQjBlVTZ1V3VtV2FsNmJhQ2RYajRoMWVQaGIwMi9vV1c0QzlQREhUekhTZHBqTTZiS0RNNSs3WFY0U3lXOXJDek9RYTZlUHUwejA4ZmRvQUFBQUFBQUFBRXRCVTJNMnBvTmVvOVRBRGZxUFV3QTZiRmN0YWxCc1NYVkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQmk5UG1IcHZtdGdKSmlnQUFBQUFBQUNVQzFpMHRRQUZ3RUZ3OXdRVUJCZFFGbGJsYzFsQjBFbmRRQUFBQUFBQVNnb3lzQlJuUDdxQ2pKK3dORFBzdmYrZ0tNNG9LSmY4QUFDak9MMy9vQ2pLd0ZBQUFBQUFBQUFBWnRhYzZDQ3lGQSt4M05OQSsvWkZBTU1FQlREdWR3Q21JRFVyYm5IUUFBQUFBQUJGUURUVERBTk5NTUEwaGdBYVlZQnZiVlREQURUREFOTk1NQTJCZ0NnQUFBQUFBQUFBbDRjNjZYaHpBWEVVRENIZE80S2Y3TXBnRk5NTUEzL0FRL3dCZ2FpKy95VUVkSnc1dW5Ud0NnQUFBQUFKVkFaOC96Zy8yMEFrVDc5bWdHZmJ2L1A4QWF4UUdhdC93b0NhbmxvQm45bFVBQUFBQUFBQUFBQUFBQUJMdzV1cm5RU05NZ0thdVNlNTc1QVRUVEZ6TEFUVHV0azBzaytRVEx1SjlHKzBzUzNMd0NXWWpmVnYyWUFkSnd4RzV3Q2dBQUFBQUpWUURmNThscGlnbW1tR0Fid2FZWUJwb1lCcHZKaWdtK1RUREFOTk1NQTAweUdBYWFZWUJwcGhnS0FBQUFBQXhZMmxnT1l0UUhTNzRTYzNXTm9EWDVTM3RGazdjZDJjb0xiTDM4cGU5N0dlOVhNcytvSmJ2amd0MXIvNllCZHFBRFViU1JRQUFBQUFBQVNnb21tZ29tMDJnb21tZ29tbTBGRTAyZ29tMzJOQlFBQUFBQUFBQUFBQUFBQUFac1lkV2JBWUZ4QWEvS2ZsWkFhbDdad1c4ZDlaQWEyYldSY0JHNUNSb0FBQUFBQUFBQktxVURmb2FhYUJwdjBOK2hvRzAwMDBEVFRUUVRhc3Bwb0tKcG9LSm9DZ0FBQUFBQUFBQUFBQUFBQW1hbnBhQWM4TWRBSFBESFFCakdzVUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVMzRTlYMFN6a3dScllucStpZWt5aDlhbDFXTTgvVnNVQUFCaWNiMjQ1OGcyTTNlM2Z3bTgvWUd4amI3bjdnMHJGOC93QjE4NXZuL0FORE8rOTkxbkVCUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFTOXU3TzF0TDBpTWJUYXZwcXpwOXdKMzVhQVVBQVo3L0FObWdHZS84bkIzL0FKOEtkZ1R2L1pZQUtBQ1pxZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRC8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Schladming-Dachstein-Nights-8-for-80s_ev_22669947	general	f	t	\N	025, +43 664 2639371, 08.2025	2025-08-28 11:08:48.633707	2025-08-28 11:08:48.633707
51	schladming_ev_24675156	Paganin Soatnquartett präsentiert IM TANZSALON	PAGANIN SOATNQUARTETT präsentiert IM TANZSALON\n29. August um 19:30 Uhr\n\nMit IM TANZSALON begibt sich das Paganin Soatnquartett auf eine Reise in die frühe Swing- und Schlagerwelt Europas und gräbt längst vergessene Perlen der deutschsprachigen Jazzmusik des frühen 20. Jahrhunderts aus.\nDas wilde Berlin der Zwischenkriegszeit und die österreichischen Operetten dienen hier als Inspiration um diesem nach wie vor einzigartigen Liedgut neues Leben einzuhauchen und in die Jetztzeit zu holen.\n\nIn typischer akustischer Hot Club Besetzung á la Django Reinhardt strahlen die schönsten Schlagermelodien in neuem Gewand.\n\n&nbsp;\n\nEinlass: 18:30 Uhr\nBeginn: 19:30 Uhr\n\nVVK: 18,- EUR\nAK: 20,- EUR\n\nReservierung unter kino@dirninger.com oder per WhatsApp oder SMS an 0664 637 90 05\n\nAlkoholische und antialkoholische Getränke und frisches Popcorn gibt es wie immer vor Ort.\n\n&nbsp;\n\n\n	Kino Gröbming	2025-08-29 11:10:41.045	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBR1FBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNZUUFRRUJBQUlDQVFRQ0FnTUFBQUFBQUFBQkVTRXhRVkVDWVhHQndSS2hrZkFpc2RIL3hBQVZBUUVCQUFBQUFBQUFBQUFBQUFBQUFBQUFBZi9FQUJZUkFRRUJBQUFBQUFBQUFBQUFBQUFBQUFBQkVmL2FBQXdEQVFBQ0VRTVJBRDhBd0NnUVFCVlFCVlFCUUFSVUFWQUFBQUFBQUFWRkFBQUFBQUFBQkZBRVVBQ0FDaWFBbFJwUG9DSTBsQUVBQUFVQUZpcEc1MERrb29NcWlnaWdDb3FBS0FBQUFvQ0FBQUFBb0FBQUFBb0NLQUlLQWdvQ0tBQ0tsQkFVQmxhZ0JVV2dncUFBQW9BTEc1MHhHNTBEbUlvSXFLQ0tpZ0tnQ2lBS0pxNkFLQWdxQUFvQUFBQUFBQUtBQUFBQUNBb21vRFNVUUQycWUxQVp4b0JrcTFtZ29JQ2lBS0lvTEc1MHhHNTBEa0FBcUtBQUFBQVVLQ0FBcXNnTG9nQ3FpQTJNNmFEUW1nS0lvS0lBQUFDSUM2YWdBQUNpTEFWSUFLQ1VGWWExa0FBQUFCUUJZM09tSTNPZ2M2aW9BQ2dpZ0FBQUFDQW9DS0Fpb29BQUlzNVJZQUFBcUFLSUFxSW9BQUNDNEFMalh4bnNHRmhabFBZQ29RRkFCbEZxQUNvQUFDZ0FzYm5URWJuUU1BQWxJVUFDS0NBQUNBQUFLSUFBb0lBQzRBQUNBS2dDb0tDS0FBcVVFYWlSUlc0R0ZBWnZhOU03b2dRd2dLbFZBVEZ3WFVVekdhMnhaeXFDQUNpS0N4dWRNUnVkQXdJQWxBQlFBQ0FDVkZYQVFWQUZBQUFCRkFBQVFpZ0tXRTZMMEt5b0NDb0FBQUtpd0dvdFNMZWdacVFBUFpBQlU4cXpld1ZyMGl4RlZpOXQrR01WR1JVQlFBV054aU53R0VBRXFvQW9BQUFJcUtDcFJBQVVBRUJmSVR5Z0tJQW9pd0dvVVNpb0lDS3FBQUFDNXdqVUJaMDB6aGFCWXpqU0FpZ0F5dTR6b05ScGlOWlJXcGVFcWZUMGFJbUppNnVneUxaNVFGYmpFYmdPWUlBQUFxQUFnQ3hyaG1OQWRNclFFRVVBRkE4QitrQlJBQll5c0JyVUtnTkRMUUFKUUFBV1RXc3hQamNMZEJyd3hWdFFGUUFQS1dpWHNFQUJxTlRxMWlOZVB5Q2J5SUF0NGhDb0RwNFlhOE1nc2JqRWJnT1FvQ0NnSWlvQUFBb0FDQUFBS3VvczdCYWhZZ0FBSW9BQXNtMEZrNDBidlRDS2hWUlVBQUZRQlVWQVZGUUVSVUFBQlZxQUlzUlFCQUd1K0M5cjhTOWdSdU1SdUE1Z0FBbEJBQUZBQ2RyU0pRUUFBQUZCQWEvSy93Q0dRRkVBQlVBZFpNakU5dGdybTZPYUtWRnFBSXFLaWdBQUFGQUVSVUFCUVJRQkJUQVJjSXYxbjllQUp4eWVhZmJ2K2dHbzFHSTNBYzlCQVZGS0RJQUFLQzRMRi8zQlhNV29JQUFxS2dLQUFLU2FBc210V2NKT3hUS3ZMUWdrM3lsN2FZdDVCQ0JBRXFpaUM5SUlxS2dBSUFCWllBdVVqZWd6L0drK1B0MDFLRFBFWjVwZTAwRjQ5SDJSYzQwQ0FBMUdvekdvRG1LbEFBQVJTZ2lBQzZ1NnlvQ0tnQ29vSUFDckVXQXY0YmpNWFVYR21aM0YxbTNvR2xPMmR4VUxXU3BpS3BFVlFWRi9hQ1ZGUlFSUVFSVUFkTDFJeEc2REhWYVl2YXowRFhlc05XLzlNZ0FRQ1J2T0w5a2FCZ0FGamNZamNvTUlBQUFDVlVCQUFGUlFFVkFGQUVBQlZpTlNjUUlhYVpUS2ltcC80dVZGSFNYaExHWldxZ25DVVFCWWdxTDVFYTVCQUFFVVJVRlJVSTBpQWhBZ0w3UXY2UUZhWmpRQ29vSmUwV29DeFRBR1FBUVVCQlVCQUFGUlFRQUZBQkJRQnJiT05qSURYOHI3WCtWOS93Qk1LSzEvSysvNlpRRUYxQUYxQUJWQUViWmFCa1ZBQklxS0lvcUFBTTBpMUFLaTFBRlJRWFBxWmlsNkJBVUEwQVFBQUFCQUFBQUFnQUFDb29JQUJPMnNTZHo3dW1Dc1lqZFRBWlJhZ2dBQUJBYUFBYVphQkVWQVJVVUFBRlFBU290SUNYOUl0L1NBS0FORjZJVUVBQlFRQVJRRUFBQUFBQUFBQUJkK2lBTHM5SUFEcGZsSE5ZQy9oUHd1eE9BRVZLQUFBc1JZQ2dvSXFBS3lvQ0tpZ0tTY1dnQ0tnQ0tnSmYwaTN4OWdDa1dwQWFLck43QUFCVUFFQUFBQUFBQUFBQUFBQUJGUUJRQVVBRlNxbEFpTEVBV0lzQlZ5a2FSV2NScW9ES21WZVZSbFVXUUc3MHl0NjVRQkFBUlVSUytQc2s3V3BPMVJma2kxQVdWRVVGQUFBQkFBQUFBQUFBQVFGQUFBQkFVRVdJc0FVVkZROWkrL3Nva1JZZ2dzUllEVWFZbmJWUlNvbW1nMk1TdFhvR0cvaXkzOGVsUlBreXQ3UUFBVVJXVUdvdjRuK0dkVUdzbG05T2JWdmhsVVJVQVZVVUFBRUFBQUFBQUFBQUFBQUFBQUFXZG9zQnJERFUxRlhFc3pmc2FuaS9nQktvcUlzUnFjZzFKNVVFVk1NVUJNVUFac2JuVVpyVjZWR0VFQVZGUlF3VUdjVUFadll0UlVRQUZWRkFBQkFBQUFBQUFBQUFBQUFBQUFGblNPbXlUaWd6bE05bTFFVnIvaXpSRlFGZ0NOL0h5dzZmRUZPUlVWbm42SFAwVUJPZm9vQUpieEZab0lpZ0lLZ0M4b29BcGdJeTB6UVFVVkFBRkVVRUFBQUFBQUFBQUFBQUFCUUFGcUtDQVlDRFg4VEFRWERBUlpjUlFiVmlYR3RSUkp5dXhKbnNHa05ob0JlV05xd0FWQVJLMGdJYUlvcHFBS2xWQkVBQlFBVkFCUnJQcVpQZjhBUU1renkxWlBESU55ejFqUHk3NEpwZEJrVUJCY0FRVUFGTUJGWEZ4QmxjWEo3YTRVWXdiNFRJRFBLNzlGeUprUlRUVnlHUUUwWGhlUDlvTUdOOEhBTURmQndEQTN3Y0F5Tkppb3lOWXlpb0tnSUtpaUNvSUFBZ3FBb0FBQU5qV0dBeU5ZWURJQUlHTGdJS0FpaW9JcTRZQ0M0WUFMaGdNaTRZQ0M0WUNDNFlLZ29BR0FBQUFBQUtJaUtZRElvS3lLQWdBSUtpb0lvQ0NvQUFEc0FBemF0cklBQ0tJb0FBQXFOUUZBVkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFcU5Nb3FBQWdBQUFDQUFBcUFBUC8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Paganin-Soatnquartett-praesentiert-IM-TANZSALON_ev_24675156	general	f	t	\N	0664 637, 0 05, kino@dirninger.com, +43 664 637 90 05	2025-08-28 11:08:48.634635	2025-08-28 11:08:48.634635
52	schladming_ev_25413732	Dämmerschoppen mit Maibaumumschneiden der Trachtenmusikkapelle Donnersbach	Am Freitag, 29. August, lädt die Trachtenmusikkapelle Donnersbach um 18:30 Uhr zum stimmungsvollen Dämmerschoppen beim Gasthof Rüscher ein. Ein besonderes Highlight des Abends ist das traditionelle Maibaumumschneiden, begleitet von zünftiger Blasmusik und geselligem Beisammensein. Für das leibliche Wohl ist bestens gesorgt, und in gemütlicher Atmosphäre klingt der Sommerabend gemeinsam aus.\n\n&nbsp;\n\n\n\n\n\n&nbsp;\n	Gasthof Rüscher	2025-08-29 11:10:43.596	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRXNBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNnUUFRRUJBQUlDQVFRREFBRUZBQUFBQUFBQkVTRXhRVkZoQWhKeGdaR2gwVEt4d2VIdzhmL0VBQllCQVFFQkFBQUFBQUFBQUFBQUFBQUFBQUFCQXYvRUFCWVJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBQUJFZi9hQUF3REFRQUNFUU1SQUQ4QTVpb0FBQ25INlJRQUFFYW5jUUFPL3dCTlR4Ykx3Q2RjWGpVN3JWOXpyeDZUK3VRUDMrdlorZjErVjg5ODl5bWVma0RtNS9DL1ZPSXM4NVAvQUtsM09lL0NpenBXZnAxb1FSUUVGQVFVQkJRRUZBUVVCRkFBQUFBQUFBQUFFb0tKdE5CUk5UUWFMV2RBYzFFUlFVQkJRRVZGQUFCZm1WdVoxL1grTWN6Z21lUWJ2NFk2OXRTNXh2OEE1WE44K1ZSbnhzazFjblA5eG9CTGNaKzMzVzBvSkp6czZyU1NZb0FBQUFBQUFBQUFBQUFBQUFBQUFBQUlCcWJxQ0FBS0FBQ0FNZ0FLZ0NpQUtBQUFBQUF2VjQ4a3p6aTJkMkExT1ZZbDkzK2Y5YlZBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkxWVEFSRnNSRkFRRkVBQVFGRUFRVkFWQlFFVUFFVUFBQUppMlo1MEVtZVc3bmYvUmhlUHgvWU5mVDF4L2JUbitOYWwzaFJvQVFBQUFBQUFBQUFBQUFBQUFBQUFBQVRUSldjeEJkUkZGRUFCVUFBQUVVQkJBRlFBRkFCRkFBQUZuS0FMd2kvdGZtY1FFOWVkWE51ZEp2cjVpN21lWi9mOGd2Mi93RHZsWnBMditLcUFBQUFBQUFBQUFBQUFBQUFBQUFaR2FCVUVRV29FRkFBWGhBQXd3QUVVQmxVVUFBRUJRQUFBQUFBRjhJQXZlUnFTem5HWjIxUHE5Z3V6NG40Vm5qeGlkZS81VWJFKzc0VVFGUUFGQkJVQlJuN29uM1VWc2M5cmN1Z3FLQ0FBQUFDS213R2NudGxyaGxBQUZBQUFQeUFqU0FFN0VBQkFVQUVGQUFBQUFCWUFnb0NOVEx4enFBTnpQM0ZZbTg1eGUyNS9ma0diUFh0WjBYdUpMSk9RYkdmdStHZnVxam9tejI1aURmM2ZETnRxQUFHZ0NLRGN1OE5PVGMrclFhQVZBQUV1c3JZeWdJQUFBcUFBS0FBSUNvQUFBQUFBQUFBQ29Bb0FLaHFBb2dEWDNmQjkxWlVBQUFBQkZBUlFBUlFBQUFBR3A5WHR0eVdYQWRCSlpWQkxHSzFXZEVSRkJVRkFNRERqNUFCQU5BQUFBQUFBQUFBQUFBQUFBQlFRVXdFVmNBUVZaTkZaWEY0aktDZ0FJQUtpZ0lLaWdBSUFBTno2dmJBRHF4Y1NYUHczeFFjeHE1UEROd0FFQUFCVVZBQUFBQUFBQUFBVUVGQVFXSEFHQ3JsQk1GVk5YR1Z4ZHhuVGFLbmFOVDRCY2tTMzBaN01RWlVGQkFBVUFXVGxmcVBwUzBFRmkyQXdxS0NDb29BQ0FJQzZJQXFBQzRnQUFBQWdLZ29Cb2dLSW9LQ3dCR2pFVmthVEFSZFJjQU5SQVVNQWFrWFo0WTBCcE5MVUJVQUJ1UmxkNEJhbFRSRkFGUlkxNFlYVUVvSW9xS0FnS0NBS2lDZ0lBQ29ScklET0txL0lNRFZ6MHpjNEJGUlFRQUZBbllMZ3JJTlJwbU5Jb2lpQ0lyS2lyaVQvR2dRVkFFVUJBMEFNVUJNTVZRWndhUUVBM0FNTVdjZ0dKWTBBeXBvQmdxQXpUbjBwdFZETDZSZG9LaU5NaUNvQXBFV0F2UHBQcTlydDlsbVNBeWdBTEVVR3VFUllDc3RKNUJZMGtWRkFTYUJXVjFueURVLzd0TTdEUWFHZGl5NkNwUk93RjZaNUpxalhzSWx2aEJZck1xZ3JOLzFkUUFzMVpQZlRGN3FvM0prVmlYbHJhaXFBRE43aXBlNHFvb0NLejVWUEs0cUNOWXdDc3RNZ0tnQ21vQXB5Z0FBQUFBc1JZRFVKT0R3ZUVVVVFDcHl0NkZHT1NSYlUwUmNNV1RoQlZrVHJWdHorRTc1Qk05TlFoT2FCN0UxZlFHL0NCc2dGNDY5UmVtZGFBN1RuZmpwYktzbHp3QnZoemRMR0JDZHRYM0daMjFlZ05YZlNkbWVrVXZPS21MTVZGQ3BFVlBLNnpUVmlWcldWdkg4TWcxNFpyWGhtOWdBQUlwb0lLYUFpb0NnQUtpZ3ZocGxVVVNoUVJyWXdLZ0lBNlRtSm1kczlBTGZCVUxmQUxwTG43WkFhRU5CYjRRN09nR3Avd0FVN0FOd2x6b3hNQmZ1cktvQ21ob0dtbWFBcWFMSm5mc0UyaGUxbmtFRlFEYUFDenBLczZQMkNMaTVwOEF5alZRRUc0QXlDQW9BQ291Z0t5QTF0K0UwOEdVRXZLN25CbWxnTXExaVdZQ0FBUVZrRlJyTmlBR0dIb0JHc1FERkpEa0FFQUFnQWVUMEJwNkdzQTlwRk5CZTJQT05zNXlDNHVFcTZEblJ2SW5Ib0UrQTRhQm1MYUpkVVFGQWpXTXhwQkxHVzJjQkJjTDBDQUFjTlpHUUdzMWZ0WldVRnhVMDBGU3pUVFFNVE9GMDBFeG5PV3RRRjN3UkZCZVVzdWhnQ2Z0Y01BbkhrNE1BUXhTWUNXRWpZREdYVnY0YXd3R0YycmlBY3B5b0NjcUdnTHdtZ0x3dVJrMmdXQnVnb0lhRk1NQlVrTUFSckJad0lNMFNpQUtnQ2dBQUExSkt1TVJ2TDdBeUdMZ0NJb0NBQUNnQUFBQUNOWWdJWW9EUFBoWlR6ZjBBME05ZjZ1K3dVRVJUQUZReGh0bkFSVEFGVkZCUGY1UXFDcWdDQ29vc0JBVlJBUkJVRUFVQUVCVEVhblFMSXFLS0FvSUtJSXVJMUZHUmFnZ0FBQUN5Nk16Mzh0Q29LZ2llYXFlYW9ETjhOSmZBRitEU2dLck02VUFCVVJHcjBncEZCQkwyeTM0WkJrVzlvQ2lLTEFBVUFFZi8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Daemmerschoppen-mit-Maibaumumschneiden-der-Trachtenmusikkapelle-Donnersbach_ev_25413732	music	f	t	\N	025, Ilsingerluidold.siegfried@aon.at, ilsingerluidold.siegfried@aon.at, 08.2025	2025-08-28 11:08:48.635548	2025-08-28 11:08:48.635548
53	schladming_ev_22956530	Platzkonzert der Stadtkapelle Schladming	Platzkonzert der Stadtkapelle Schladming beim Pavillon am Schladminger Hauptplatz.\n\nDie Platzkonzerte der Stadtkapelle&nbsp;Schladming sind ein musikalisches Highlight des Sommers, das jeden Freitag stattfindet. Diese stimmungsvollen Konzerte laden Einheimische und Besucher gleichermaßen dazu ein, die warme Jahreszeit mit traditioneller Blasmusik zu genießen. Vor der malerischen Kulisse des Ennstals präsentiert die Stadtkapelle&nbsp;ein abwechslungsreiches Repertoire, das von klassischen Märschen bis hin zu modernen Stücken reicht. Die Konzerte bieten eine wunderbare Gelegenheit, die Kultur und Gemeinschaft von Schladming zu erleben und sich von der Musik verzaubern zu lassen.\n\n&nbsp;\n	Pavillon - Hauptplatz Schladming	2025-08-29 11:10:45.307	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRGhBWkFEQVNJQUFoRUJBeEVCLzhRQUZnQUJBUUVBQUFBQUFBQUFBQUFBQUFBQUFBRUMvOFFBS3hBQkFBSUFCQVlDQWdJQ0F3QUFBQUFBQUFFUklWRmhnUkl4UVhHaDhKR3hBaUpDMFZMQmd1SHgvOFFBRmdFQkFRRUFBQUFBQUFBQUFBQUFBQUFBQUFFQy84UUFHUkVCQVFFQkFRRUFBQUFBQUFBQUFBQUFBSUVSQVNFeC85b0FEQU1CQUFJUkF4RUFQd0RJaWdBQUtpb29CdUNxelM3Z29pN2dJYm0vZ0VVb3JVQlUrVGNHaE1jL0VHT2ZpQVVUSFA2TWMvRUFvemVlUFB4Tk5YRWRKLzhBT1lGRkhGcFBzV2NVYTlQS29DM0UxcXplVi9DS29tT2ZneHo4QW9tT2ZneHo4QUttT2ZneHo4QW9tT2ZneHo4QW9tT2ZneHo4UUFHT2ZpREhQNkFFeHorakhQNkFEZjZNY3dBM1RjQU53QkFFQUZYQUZRd0FEQW5RTEFpSlZDd2FHYkxCYVBaUzBqVUd4TDBMREJVdjNBc01hR2JMREdpTUdiTEREUGVmajhvSjYvOEFMekVFVFhTRGlqS0ZNWHJQdjhVMHkvTEQ0bVRpai9HQzR5RENQNDlvOHJIS0s1OVBtVXVNdllMakhEbUdkYXU0K3htMXRERkVzc01VU3l3eFJMTERGR2JXd3hVTFN3eFJMTERGRXNzRlFzc01BdEF3QURHNWlNa3FNdmNXRlVyVlJsNUtqTHozL3BrQ3RWR1hsZUdHQUszVWU2Snd4a3d0Qld1R0owWGhoaWlnclZRdFJreFJXb1ZyaGlaNTkxNFlZb3JXUGtLM3d3Y01NMFYyUXJYREJ3d3pTVUZiNFlPR0dLV3V3VnJoZzRZWnJzVUZhNFlabUkzdUNpdXlsU2V0ZEUrT3JVZmpxY05kUXBHTXkxd3d6WFlyc2hXdUdEaGhtdXhYWUsxd3djTU0xSlhZSzF3d2NNTTBVRmE0WU9HR2FLN0JXdUdEaGhtcEtuUUsxd3djTU0xMktDdGNNSERETkZCV3VHRGhobXV4WFlLdFJsMEtqTDdTa29LMVVaZVNveSsyYUFyY1JHUnd3d0tWQUtFVVJVVmRoTEFGNm9hUURXM2crUGhNZENad3luM2tBc0psVXppWEFOVjdRbHhtbHhtRFd4V25oTExqMndYREtFdzBUbmRUNElubnBJTGhvWVpKY1pxQzRGYUpjWnFCVUZRSkZ6MWo0QnFrck12bmZUL2ZLajl0STc0cWhoa1laSnBQUDdWRktqSXdaeG5MQ1Z4MDhndFFWR1VKZTJaY1pndEZhSmNGeElMZ1laSmNabHhtQzFHUW5GR1pjWmd1QlVKenFwejVKeW5HWjVBMVVJWEJjWmdVVkJjRnhtQlVGQUNVVW9DVWxLQXlDcWlLZkJTS0FSaUFkWTNXcEtuUUU2d3M5TzVqb1ZPZ0g1Y3QxNWFRa3hNODZQMjBBaXJ3eU9wVTNlRmxUZDRlUVREaTk1dFk5TWQwcWJ2QXgwQS9IcjNUbk84K0ZpSmpsUlU2QXVtaVZqWFRudWZ0b1ZQUEFGMFNNTGpHYUltZWVIeWx6ZDlKOGcxZlUvR3JuQ2Nmb2lKbUp2cXY3YWVWUkp3L0tOWit1WDJUZHg3N2d0WGQ0MzdnVitVWmZBSk9FeDMvQU5GN0xVODd4OGZDVk4zZ0JIT2U4ZlNSei9KYW5RL2JSRlQrV3kzR04rN0pVNzU1OXpIUUQ4YnlKdWE2Ui9lQmpHUlV6enJZUmVTUlhGTlpMKzJpVk4zZ0M5ZGpDKzZWTjNnVk4zZ0tmeTJYcnQ3OHBVM2VGcisybmtFckdQZVN6TWRmZGtxZWR4WmpvQitQS2U1Y1l4N0pFVEhLbGk5QUk1UUdPaGpvQWk0Nkpqb0FHT2lmQUlwQUFDZ2lpZ0FBQWdLQUFXQUFvQ0tBQUFKVVpRb29DaUtoYXM0VHFrWVRRTm9xQWdxSW9BQUFBQUFBQUFBaWdJS2dDS1VDQzBnQ0tnSXFLQXFLQXFBS0pzQW9BQUFDb0FvZ0NoOEh3QUFBb0tnU1dsZ2t4MGhZaitrdG9WVUFRUlVRQW9vVUFxTWdBcUN0SUFEYUN0QUN5dENnQXFNa3dCYlN5b0tnRlFxRUJTMG9BUUFRQlVVQkZGUlFBQUZSUVMxQUFBRVVBQUFVQUFtYVZBWm1iT3lMRXF2dkZqQlV0SWtUM3JTcENpQUNBZ0NnQUFBQWlnQUFDQUtJQUlBQUlBSUFBS2lpS2lxcUFLSnNiQW9iSnNDaHNmSUFtT29DaHNiQW9ueW9BQUtJQXdLalRRc2MwV0VPL0d4QkdWRTJBVkFBQTJBRFkya0FUYVRhUVVUYVM5SkFDOUM5QUVVMkJBdlEyQkFBQVFBQlVVUlVWUkFGVkFGR2JMd0JvWnNzR3JHU3dhVm01SWtHaEZBQUJVa1NRUkdxaEtWZFJZSmlpQTcxb0JFQUFCRkFCQVVBQkFBQ3dBTFFGRUFFQUFFQUFWQVJRQUFGUlVVQUFSVTZxcWdDZEF5QkY2a0lzSUtvQ2dBQ0tBZ3FBQW9BZ0NpQUZsNlNkYjBTOEpqdnVDM3BLWHBKZUViZjlsNDZVQlpOeFdQZzZTVGoyNmdiM3NIUHRIdmc1V0Jva2t6N1FCTnd1V3JPL2hmTWdZcGlxQWRBNkNvQUFBZ0FBQUFLQUFxQUtDSXFnQW9nQ2xvb0tnQUtpZ0FBQ0FLQUFiK0JBWDNrZ0F2dkkzUUEzTDFNa24zQUZzVHJ6TXU0THVKMVRlZVlMZXB1ZFpUTUZMVElCUkJVQlA3VUFRQUFBQUFBQVZBRkVBVUFCVVZGRUJVVVJVVlJBRkFCUUpCQVFGVkFGUlVBQXNBUlFFVkFEQUFBc0FRc1ZBQUFBQkZRQUFBQUVBQVZGQUFBQUFBQVZBRkFBQlFTbG9BQ2xBYVlXNXpBUXBRRVdBQmVpVXRvQUFnSW9LZ29JZ3FDaUtpb0FBSUFLZ0FBQUFBQWdBQUNnQUFBQUFBQUFBb0FBQUFBb0FBQUFBQUFBQUFBQUFBQUNBQUFBZ0FBQUFBQUFBQWdBUC9aIiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Platzkonzert-der-Stadtkapelle-Schladming_ev_22956530	music	f	t	\N	+43 664 15, 00 638, 638stadtkapelle@schladming-net.at, +43 664 15 00 638	2025-08-28 11:08:48.636483	2025-08-28 11:08:48.636483
54	schladming_ev_24387769	Balance finden - auf der Matte und im Leben	In der Yogaeinheit „Balance finden - auf der Matte und im Leben“ werden fließende Vinyasas mit Atemtechniken und statischen Asanas kombiniert.\nBesonderes Augenmerk wird auf Gleichgewichtsübungen gelegt, die die kleinen Muskeln und Sehnen an unseren Gelenken, Fußsohlen und Handflächen stärken.\nUngleichgewichte werden sowohl körperlich, als auch mental reduziert. Affirmationen, die dich erden und bei dir bleiben lassen, leiten in die einzelnen Asanas. Eine Abschlussmeditation gibt dir Inspiration und Anhaltspunkte, wie du dich abgrenzen und immer wieder zu dir zurückkommen kannst.\n	Hotel Rösslhof****	2025-08-29 11:10:46.895	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzY4IiBoZWlnaHQ9IjQxOSIgdmlld0JveD0iMCAwIDM2OCA0MTkiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBR2pBWEFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNBUUFRRUFBZ0lDQXdFQkFBQUFBQUFBQUFBQkVURUNRUkloVVhHQmtjSC94QUFWQVFFQkFBQUFBQUFBQUFBQUFBQUFBQUFBQWYvRUFCUVJBUUFBQUFBQUFBQUFBQUFBQUFBQUFBRC8yZ0FNQXdFQUFoRURFUUEvQU5nQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFsdUFWTXhpM0tBNmpscGZLZzZDU3lxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDVzRjMnVWeldRQUFBQUd1TjZ2NHlBNmlTNWlnQUFvQUFBQUFBQUFBQUFBQUNLQWdvQ0NvQUFBQUFBQUFBQUFBQUJRYzZpMUFBQUFBQUFhNDl0dWZIYm9BQUNnQUFBQUFBQUFBQUFBQUFBQUFBQWdvQ0NvQUFBQUFBQUFBWC9BdnIyRGtMTnhlV3daQUFBQUFCZU80Nk9jM1B0MEFBQlFFQUFBQUFCUUFBQUFBQUFBQUFBQUFBUlFFRlFBQUFBQUFCTHFxWFFPYzJ2THBMNlc2eWlzZ0tnQUFBQk54MWMrTy82NkFBQW9DQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWlvQUFBQUFBRE4zRTZ3dmFDc2kxRlFBQUFtd2JuVFNSUUFFRkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJBQUFBQUFBQUFacGhhQ3NWRnUwVkFBQUFIU0t6Tk5BQUlLQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBaW9BQUFBQUFBQ1hsSUNzMnMyMm9LVUJVQUFBQWI0NmFaNHRJQUFLQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNDb0FERm9ONWtaOG1VVVcyMUFBQUFBQUFBQUFhbks5KzJRSFR5bnl1M0lCMkFRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRRkVBWjVNcmRvS0lvcUlBQUFBQUFBQUFBQUFBRHNBZ0FBQWdDb29BQUFBQUFBQUFBQUFBQUFBQUFJS2dPZEFGQVJVQUFBQUFBQUFBQUFBQUFkZ0VBQUVCUUFBQUFBQUFBQUFBQUFBQUFBQUFBRXVsUzZCekFWUkZRQUFRQUFBQUFBQUFBQUFCMkFRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQXVoTHFpc0FBSXFLQUFnQUFBQUFBQUFBQUFEc0FBQWdBQUFBQUFBQUFnS0lBb2dBSUNya3lnQzVRQUFBRHFpWFFNZ0tBTE5WQmtWRlFBQUFBQUFBQUFBQUIyUlVRRlJRQkFBQVVBQUJBVkFBQUFBQUFBQUFBQUFBUzZWbWdnQ2cxTk1OenBBdW1GdnRBQUZRQUFBQUFBQUFXOUl0MERvQWlnaWdBQUFBQWdBQUFBQUFBQUFBQUFBQUFBREYyMVdRQUZCcG1iYlFZdndLZ0lBcUFBQUFBQUFBRFhYNHkyRFFDS2lvb0FBQWdDb0FBQUFBQUFBQUFKUVVBQUFBR2JRTFVBQUJSWXFScEJtb3FiK2dFQlVBQUFBQUFBQUcyR3BvR3dFVkZSUUVBQUFBQUFBQUFBQUFFdWdWS2tLQkswd3VRYUV5bVFXMWtBQUZBRmtCUUVFeDdTM3FHVUFBVkFBQUFBQUFBQnFhakxZTklDS0FBQUFBQUFBQUFBQUFBQUF5VmJHUUFBQUFBQUJmU2dZQUFBQmxCVlJBQUFBQUFBQUFBR21WZ05nSW9BQUFBQUFBQUFBQUFBQUFBaWdKaUpWcklBQUFDZ1pBR2hscEFTcjB3QUFxQUFBQUFBQUFBQUFBT2dDS0FBQUFBQUFBQUFBQUFBQUFBQWxaYVpBQUFBVUVWQkJVQWF5eUFBQUFBQUFBQUFBQUFBQU5xSWlxSUFvQUFBQUFBQUFBQUFBQUFBRE5hU2d5QW9BQWdBZ0FBQUFBQUFBQUFBQUFBQUFBRG9nSW9JQTBJWkFCQWFFTWdvZ0NpQUttVXlnTGt5Z0M1VmxjZ29JQllpNUFSRlJRQUVBQUFBQUFBQUFBQUFBQUFBQUFhQVJRQUFRQlVBQUFBQUZRQUFBQUFGUUJSQUFBQVFVQUJBRkJBQUFBQUFBQUFBQUFBQUFBYUJFVUFBQUFBQUFBQUFBQUFVQUFBQUFBUVVCQUJBQUJmbEFBQUFBQUFBQUFBQUFBQUFBR2tCRkFBQUFBQUFBQUZBQUFBQUFBQUFBUVFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWYvL1oiIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Balance-finden-auf-der-Matte-und-im-Leben_ev_24387769	general	f	t	\N	+43 3687 81444, 025, 81444hotel@roesslhof.athttp, 0.08.2025	2025-08-28 11:08:48.637221	2025-08-28 11:08:48.637221
55	schladming_ev_23905409	Yoga Specials im Hotel Rösslhof**** Ramsau am Dachstein	Einmal im Monat wird der Samstag im Hotel Rösslhof zu einem besonderen Tag der Ruhe, bewussten Bewegung und inneren Ausrichtung. Den Auftakt bildet eine wohltuende 75-minütigen Yogasession am Morgen – achtsam geführt, für alle Erfahrungsstufen geeignet. Der Fokus liegt auf dem bewussten Atem, auf liebevoller Präsenz und dem Wiederentdecken der eigenen Mitte. Nach der Praxis erwartet Sie ein genussvoller Brunch mit frischen, regionalen Köstlichkeiten – ein Moment der Stärkung und des Genusses. Im Anschluss tauchen wir tiefer in das Special - Thema des Tages ein: Jeder Samstag steht unter einem besonderen Impuls für Körper, Geist und Seele. Durch Yoga, Atemtechniken oder stille Momente entsteht Raum für Selbstfürsorge und neue Perspektiven.\n\nDie Teilnahme ist für Hotelgäste und externe Besucher mit Voranmeldung möglich.\n\nAblauf Yoga Special:\n\n\n\t08:00 Uhr Yogasession (75 min)\n\t09:30 Frühstücksbrunch\n\t11:00 Uhr Yoga Special (60 min)\n\n\nInklusive: Tee, Trockenfrüchte, Nüsse\n\nYogamatten und Yogablöcke vor Ort\n\nPreis: 55,-\n\n28.6.2025 „Mindful Yoga – Für Körper, Geist und Seele“\n\nBei „Mindful Yoga“ legen wir besonderes Augenmerk neben klassischen Asanas und Vinyasas auf die Atmung in Kombination mit Dehnung. Ein gestärkter und gleichermaßen gedehnter Körper findet mehr Aufrichtung, wodurch eine tiefe Atmung ermöglicht wird. Und eine gute Atmung führt zu mehr innerer Gelassenheit und Entspannung. Abgerundet wird die Stunde mit einer ausgedehnten Endentspannung, einer Yoga-Nidra Einheit, um Körper-Geist-Seele nach der Yogaeinheit runterzufahren und in Einklang zu bringen.\n\n26.7.2025 „Energie und Lebensfreude entfesseln – Dein Weg zu innerer Kraft“\n\nErlebe, wie Yoga dich mit neuer Kraft erfüllt und deine Lebensfreude zum Strahlen bringt. Inmitten ruhiger Natur laden wir dich ein, Körper und Geist in Einklang zu bringen. Durch dynamische Yoga-Flows, bewusste Atemtechniken und Meditation aktivieren wir deine innere Energiequelle und lösen Blockaden, die dich im Alltag hemmen. Dieses Yoga Special schenkt dir Raum zum Auftanken, Loslassen und Aufblühen – für ein Leben voller Leichtigkeit, Vitalität und Freude.\n\n30.8.2025 „Balance finden - auf der Matte und im Leben“\n\nIn der Yogaeinheit „Balance finden - auf der Matte und im Leben“ werden fließende Vinyasas mit Atemtechniken und statischen Asanas kombiniert. Besonderes Augenmerk wird auf Gleichgewichtsübungen gelegt, die die kleinen Muskeln und Sehnen an unseren Gelenken, Fußsohlen und Handflächen stärken. Ungleichgewichte werden sowohl körperlich, als auch mental reduziert. Affirmationen, die dich erden und bei dir bleiben lassen, leiten in die einzelnen Asanas. Eine Abschlussmeditation gibt dir Inspiration und Anhaltspunkte, wie du dich abgrenzen und immer wieder zu dir zurückkommen kannst.\n\n27.9. „Herzöffnung – Liebe &amp; Mitgefühl aktivieren“\n\nHerzöffnung im Yoga bezeichnet eine Praxis, die physische, emotionale und energetische Aspekte umfasst. Durch spezielle Asanas (wie Rückbeugen, Hüft- und Schulteröffnungen), Atemübungen und meditative Achtsamkeit wird der Brustraum geweitet, die Wirbelsäule gestärkt und das Herzchakra aktiviert. Ziel ist es, mehr Mitgefühl, Selbstliebe, Offenheit und emotionale Heilung zu fördern. Herzöffnende Yogaübungen helfen, Haltungsschäden auszugleichen und unterstützen gleichzeitig einen bewussteren, liebevolleren Umgang mit sich selbst und anderen.\n\nInformation, Reservierung &amp; Buchung:\n\nFür weitere Informationen, Terminreservierung oder Buchungen sind wir gerne telefonisch unter +43 (0) 3687 81444 oder per Mail unter hotel@roesslhof.at erreichbar.\n	Hotel Rösslhof****	2025-08-29 11:10:48.679	\N	https://www.schladming-dachstein.at/A-Z_Liste/Ramsau%20am%20Dachstein/R%C3%B6sslhof%20Yoga/image-thumb__1993737__masonry/R%C3%B6sslhof%20Yoga%2001.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Yoga-Specials-im-Hotel-Roesslhof-Ramsau-am-Dachstein_ev_23905409	wellness	f	t	\N	025, hotel@roesslhof.at, +43 3687 81444, 81444hotel@roesslhof.athttp	2025-08-28 11:08:48.638103	2025-08-28 11:08:48.638103
56	schladming_ev_24750595	Qi im Kneipp Park	Ab dem 11. Juli 2025 lädt PSB jeden Samstag von 10:00 bis 12:00 Uhr zum neuen Outdoor-Angebot ein:\n„Qi im Kneipp Park“ – sanfte Bewegungen und Atemübungen für mehr Energie und Achtsamkeit inmitten der Natur.\n\n📍 Ort: Kneippanlage, 8960 Öblarn\n💶 Beitrag: 15,00 € pro Teilnehmer\n📞 Um vorherige Anmeldung wird gebeten!\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Öblarn","postalCode":"8960","streetAddress":"Öblarn 311c","email":"info@psychosozialeberatung.org"}	2025-08-29 11:10:51.121	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDQwMCAyNjciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUxBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNjUUFRRUFBUU1EQXdVQkFRRUFBQUFBQUFBQkVURkI4QUloVVdGeGdSS1JvYkhSd2VIeC84UUFGZ0VCQVFFQUFBQUFBQUFBQUFBQUFBQUFBQUVDLzhRQUZ4RUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRkJFZi9hQUF3REFRQUNFUU1SQUQ4QTVnQUFBQUFBQUFBQ29BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBcUFLZ0FBQXFLZ0FxQ2dBZ0FBQ2lvcUtJZ0FBQUFBQUFBS0NBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNvQ29xQXFLZ29BSUFBS2lpb3FLSVh1Z29JS0Nvb0Fpb29JcUtDQW9pQW9xQUNMSmthNmFsL3dWa0ZFUUFBQUFBQUFBQUFBQUFBVUFSVUZWRlFGQUJGUlFRVkJCVVVWRkFDTlNaMFpqcE5BWXN3anByTEhNQUZCQUFBQVJVVUVVQUd2b3AwenZudzZBNVNXWEY4VmJwR3VydGkrR2IyZ01LaWdnQWdBQUFBS2dvQUlBQXFLZ3FnQUlxQXFLZ0tBQ0tpZ0lxQW9BQVJRU041N2MxMVprN05TekdOQVdGdmxXZXJXVG5jR1F4aWlLZ1JWUkJjR01RR1ZOZ0FnMUp2UVdZMm1Kem1XcmNNcFFYcXVaN2s3eU01K3pVMEVUcW04MFpiblZ0V0wyb3FDb0lDb0Nvb0tBQUFBaWdBWXE5T3Nic3lEbUxaaEFFVkFWRlFGQ1p1aTRzQmxTTnlUeURDTlZBQVhGQklwQkZ4dnAwaWRVMys1MDNacFVTVzRtV09yV3Q1Y3dkTmNNMGwwYnhLZzV4cWRQbHJNakY2c3FOWHFudXhia0VWTnZtLzRHM3lLaEhSaU5nZ0FqT0Y2ZHhacURGMVc2UTZ0VUFSUVVSckNBQ0tBQUFBQUM0QmVuVnRtYXBrQ3NnQWlvQ29vRHAwOXA3clVta1RTZDZERTFkSTV0U3lUSUpibW9BTDA2dDR3ejA2dFczd0RPTUlaelJGeEZ5YmZMS28xbnRoRVVSWTNqeG4yWm16ZHZZVlBoakdGeXprRkNDS2JmS0x0OG9xRG94R3Y5QVF5Q0tUdlJaaWJpbG1mbU1XWWJ6cDdpRG1zWEUxaUtLelZUQUlvQVlwaXR6dEV1YUl5QUtLaXdSclR1ekZxQUlBQk1iZ0t2YnhmdUl1QkY4TTI1V29DekcvN2J4MCtJNW1hRGRreG51eVp2bEFYSmIvVUtBQUJzaW9Bb0FzcXBGQmtVQkdtVjJGaDU5enQ1UFB3QXVMREtKa0Z6N0psRkVWbFVBQUFBQlZSQVdyTlVoTGdIUk5iZnN6OVhvWlVRRlpVWHBpWXVNcmV5b3YwNTM1OHBaWW4xVXphQ0FBRFVMa1ZsclpKR3MrQVlHcmo1WkVFVUJGQUdwcGxsdlpuRUZRQVJBQVVBQmRrYXpBWkZ1TmtBWEtBTDVDZXFBSUFBcUExSmxyRXJFdU5HNWRMNTdDbDZaRWtsYXZlVmp2QVg2WWw3WHN1Ym40M21EcW1jVkJrZ2QrUlVYVFpCQVVBRkJyT0JWdWpKOVU5UzJYeURKaHJNTXdSbkZSdTFrRkpPNnpRK3FDbFphekdSQU1ya0dSU0FMTUdVbUFYS0JrRVZyS1VFUnJaa0ZSVUJTN0RYVHVESVhWQVVpS0M0N28xTmI3Sjh3RUFBUlFCcnAwckxmVE1RRm1NUytpVzlxVFQ3czU3WVJWemk5Nlo3WVpBYTczUm5OSmNGVUVBUlFCVlc2ZlpscTZmWUdScnN5QW8xVUdUUzl0a0ZScWFNdFJJQ0FDZ0Fnc1NrQXVxS0FpaXdVTml4TDRFV2FWbHFhTWdBQU5SbFFMNUZ1MFM3ZXdDekNMUCtpbm4yVEhyUHVlU1FROVJVQUFCcnAxcTFPbmNxYXFJQ2dBSUtMaEZaUlNxaUtpN0FMYWhRUUFGamRZVzFGTmtpN2ZDVFZVRmhFQUVBWEtzckFSWUFBSUNrTW9DNUtnQ3hGUUZFVUVBQnEvNGwveUl0OGdqYzM5bWNBQWdDaUFMRlFCcnAxclRtM25LVllsaVdOWFJnS1JVV0tSVFpFeWdGRjIvSDI1RlJsZGtYQUMxbGNnZ0FBQUxrbXFBTlJsVUFBQUFBV0lvRlFBQUFBQUFBQUFCZXdBTGlZOVVBUUFBQUFBV1dZRUFVemhBRnlnQUtnQ2lMa0FNcmtEQlAwR1FaQlpBSkZ4em44YTV6MS9TWG5OVWFaRkJVVUFNSlkxRjV6bVlJNWpWaktzZ0FDb0FxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXFBS0NBb2dBM05PZS84QUdHNXB6MEtzWG5QZS9vdWk4L04vcGRyelJGU2RwdXV2eDdwbWM5bHpueUllMm1lNlhUejkxL0hjek9aVVNibk9lOC9NV1hOejZRNStML1VWbTgvWDhZZEx6OE9aRW9BcUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQURVWkFkT2MvVjhGMDV6K3BMem4vQUpTODUvRWFSclR0NkpMaGMrZ0hQdXpoY21RSXZPZnUvWklaNXo5VDVBdk9mbGhiY29yTkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFGeWdDNU1vQjJya3lnSGF1VUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBSC8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Qi-im-Kneipp-Park_ev_24750595	general	f	t	\N	025, +43 650 22, 742info@psychosozialeberatung.orgwww.psychosozialeberatung.org, +43 650 22 12 742	2025-08-28 11:08:48.63903	2025-08-28 11:08:48.63903
57	schladming_ev_9446763	Photodays im Bikepark Schladming	Du wolltest schon immer&nbsp;professionelle Bikefotos&nbsp;haben? Willst aber nicht ständig deinen&nbsp;Flow unterbrechen, um Fotos zu machen? Oder du bist&nbsp;alleine unterwegs? Dann bist du&nbsp;bei uns genau richtig.&nbsp;Unser&nbsp;Fotograf&nbsp;wird den Tag verteilt an&nbsp;verschiedenen Streckenabschnitten&nbsp;auf dich lauern und dich&nbsp;ins beste Licht rücken. Ganz egal ob bei&nbsp;großen Sprüngen&nbsp;oder&nbsp;engen Anliegern.&nbsp;\n\n\n\t30. und 31. August&nbsp;2025&nbsp;im Bikepark Schladming\n\t\n\tAb dem darauffolgenden Tag kannst du&nbsp;alle Fotos auf unserer Website anschauen und zu einem fairen Preis als Download erwerben. Oder du&nbsp;bestellst sogar dein Bild als Printprodukt, das du&nbsp;nach Hause geschickt bekommst.\n\t&nbsp;\n\n\nFotografiert wird von 10:30 bis 16:30 Uhr abwechselnd auf der Pro Downhill &amp; Rookie Downhill zur 99 Jumpline, der Flowline und der Monster Jumpline. Wo sich der Fotograf gerade befindet, wird in der Instagram Story (Account: bikeparkschladming) im veröffentlicht.\n	Bikepark Schladming	2025-08-29 11:10:56.684	\N	https://www.schladming-dachstein.at/A-Z_Liste/Bergbahnen/Planai/Sommer/Berghighlights/Bikepark%20Schladming/image-thumb__483110__masonry/Bikepark_Planail_August_2021__403_web.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Photodays-im-Bikepark-Schladming_ev_9446763	general	f	t	\N	025, +43 3687 22042, Web: H.Coburgstrasse, 0.08.2025	2025-08-28 11:08:48.639733	2025-08-28 11:08:48.639733
58	schladming_ev_25521953	Feuerwehrfest Aigen im Ennstal	Am 30. August 2025 lädt die Feuerwehr Aigen im Ennstal&nbsp;zum großen Feuerwehrfest im Rüsthaus Aigen. Ab 13:00 Uhr startet das 14. Boccia-Turnier, ab 18:30 Uhr folgt der Dämmerschoppen mit Livemusik von der Mühlviertler Power, danach sorgen Disco &amp; Seidlbar für beste Stimmung. Für Speis &amp; Trank ist bestens gesorgt – der Reinerlös unterstützt die Finanzierung von Fahrzeugen und Geräten der Feuerwehr.\n	Rüsthaus Aigen	2025-08-29 11:10:59.204	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMyMSIgdmlld0JveD0iMCAwIDQwMCAzMjEiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRkJBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNrUUFRRUJBQUlCQkFFREJRRUJBUUFBQUFBQkVTRXhRUUpSWVhHQkVwSFJNcUd4d2ZEaFF2SC94QUFXQVFFQkFRQUFBQUFBQUFBQUFBQUFBQUFBQVFML3hBQVpFUUVCQVFFQkFRQUFBQUFBQUFBQUFBQUFBUkV4UVNILzJnQU1Bd0VBQWhFREVRQS9BTUM1N0lBQUFBQUFBQmdBQUFBQUFBWWZrQU9BQUQ4QUJ3Y0FCbnlZQUdBQUdBQmh3QUg0TkF4WjJnQWNlNjFBTStUQUF5bUJ5QUx6N20vSUlGcTZDWlYvSnFjQXZCcHdjZTROWWQ5a3Y3RitBWnN4R3pKZXVBWUN6QUFEZ0FOTkJlVDd4QUM0dkNBTDlZY29BQnROK0FBNE9QQUhzQzhBZ2NleG9HVXdBWGozcHFBR21nQndjQUJueVlBR1ZxU2Y5LzNsbFpRTEttTmI3SmRCTU9BQTM0Tm9BQUFBQUFBQUFMS3lBNkREVXQrLzhncVpMMXhmN0d4UVlzd2I3WnoyQkVWQUFBQlFBQUFNQUJjUHdDSEp5QUFzNDU3QnZNWjlYWmI3TWltR0FJc3lMeGVQMitFbmxBWEVhaFJXY0RqNUJEZ0RLQ3lyV1doV1F3RURnNFB3QVlhQUdBQitBNU5BRFFFRlFBQUZKY1FCdlkxSE5kQnBQMCszRE8wMERNUlFBWDhmM1RuMkFGNU9RUVhuMmh6N1FFT1ZrVUdkcHJRQ1Q2VUtLaU5BakxjNlJxQXpZeTZYcjRaQm1Ob24rQllXZVZrUERVOGZRTVdJM1VFWmFUc0ZoVWFCRXhNK0doUlAzUDNWWno5b0puU1dPbWNNMEdjTVVVWkNpQzFsdG13RUFBQUFBQlFBQUFVUlFVUlFBQUFGQUFCdXlaMHd1OElNcmh2dW91SVNxbUF0dThNcmdDSFZVeWdsYW5QS1dmOEFxWURWNTRRNlBBSUFDZ2lvb3kwQWRDVUc5NFpSUUJaTmJrd0hPejNHdlY0WlFCRkJtbzB5QUFBTGxRRkZBUUFGQUFCQVVNVUVha1pyYzZBL1N5MnhlNkNWWWl6MlVRNldtYWdwL3dDSjFlVkZ2RHUwRXZRSEZhejJySHB1T2dNZWNPbWtvaUtBMHlGN0Jtb3JYNldiTUFBVUFCQnFUU1o1YkZCRGM3UVQxZUdOWDFYV1FVVkFWbXRBTUxDeGZBTEt6ZXhBYUFBVEZXUUdXcG9BSmlnSW9nTHFRT1FheU1yeUFpemlzM2lnTlcrRWlLQzdwdmd5Z3VLbllBbUx0YjhKc0JGeW9zQkFaNzRCcUlaVEw1OHF6aXpvdkpObjBsdW9xNFZJditGMU1aSk5QTHBKZ09ldCttOE0zdXJPdUtpazlTZGdvelFvZzBnQW9nQ25VQ3FNQUlOTEl6RzlnSllrYTJNNkFzbTZ5MUw0QmMrV2VtMmJOb0lTYWpjNkJVcWdNMEVBcElUdFZpVk1XVG1DWGl5bFdjMTA0U3c0TDE3SXJMUDh0R1NjMEt0OXZwT2ljM25wcXpnUm5RQllYcEo3dFEzeFFxek1QSk9GOTBSbjFlekRkOTJGRzU0TGNaNldna2RQVGVITHBaNnJGRnY5U3p6OUxPZVVuZCtxQ0NLRE5DaUNnQUFBTk1xb2xqTG95Z2tieWNwMHVnWkl6azkydDB5QXptTGs3TENkZm1BMU1ROGZhWVliaFZsNFpwNmJpNGE2SmVEWWxRUkFCUExTVHRWM0ROVG9VeUkwdTRscS93QUg5eG1JWHd2NS9abm1pbks3d3lzZ0VYT0dUYURVVm1LRjQxdkgrVmM5clloV1BMVlNlVjhGMzQvc3VlcS9Sc1dXVkJqOVB1dVJxcE9hb1JQZjVieFBWMERtb0FsTUtpQ2dBS0FBQUVBaXhLcVpGTVdwQlpVVGVVOFdONHo3cjN4KzZlNlFwNUVxS0haNUZnRTkvd0JnMFJSQlFUM1ZJb3NGNFpYVVZyeFVVMVVpWDZRdElpaTlBcWUxTEdXMHNCbHFJc29WTWJadWZhL3FFS3g1YS9WOEpNMEZ2YStudEtSVWRLejZaeDl0SkxrK3Y5SXFzK3BkVE9LREl6VlVLaTltSUlGQWFFZ0NnZ0tBb29paURGN2J6VXNLU05TOVgzUzlwK3IyUDFJcDJpYUtMN05NbW9OU1MxRTAwQnI5U0FBUXYwalNSZGlScmdEZjdtbnN1cU0ycEd0WmlEUWlxQUNETk11S3ZpTll6YjlZd2FxWUloT2FFUlZGeXIrbjVWR3ZUMFdjNlNZdXlJcklBakZRQlZpb0F0dnNmcVR6OWwvc0RVdW0vdXpPRi8zL0FJQmQramZwbnEvQUNpUlFEUkFXWGt0bFNtQW1IUy95dVVHUXdBTUZBeE9tZ0dkTmFaQnVKVlo4alNuQnd1UkFPQmNVWlNOWXpFRlVBVUVCbXhmMlZtcXpWNUJKMnVtTGlkTklndjZ2Zy9WV0FHdHZ1Z29OeEtGNUVjeFVGV0JGQS8xdi9pU2VMMEU1QmN6bi92OEFxbmYyM09tZjFBWkZzbnVuNnI4Ry9RSkl1TEZVWlJzQmhmWmNTQWV5cDUvS2dKWnFnTWU2bzBnaWdBbmxVOGcxMng1ZFBiNnJtSzB2RFBKcUswWW1xb1dNeGIwayt3VlUwMEdoblRRMVdmSzdVdlloZWowLzZXeTU4QW5HdlpQVTF5eG5mdUZyTklVQlZSUVZVaWd4VVdvQ3hXWmNYUVc5WDhKMXg1OC94L0t6cS9hVHNGLytXV3IvQUV6N3JJQ29nT2s2RW5TcWlLaWdyTWlwNTBWUDVhWjhmdTBBazhxZ0pPMXlwTzJnWmF4S29HUkpPVklnenQ5eWRvZVFiQUdrVm55MElsNlpqVjZaRXFnZ0tDL2tBbnVsWHdzUzF1ODU3VmpxNDE0L0o2cHpvSnVKcE5VUmMzZDltSFMrZnc1aXdYZWtSRmIyS2s5TFdBNTN0R3IyZ0VuQjBzQVBGKzRUdGU1bnlUMDRCZjZmM1lkTE9NWXNCa0FHNTByUHBhVVo4eHBueitXZ0t3MTVaUWE4ZnVzVHhDS0trVm5xZ2VmeTB3MkJlZ0FEd0w0UVlSZkNBMkFOSmUxWnZsWUlYcG1OM3BnS3FLQ0FpZ05NeHBZelNUbGJXUlJSVVNGaTN0bWkxVDFscjA5TU5Tc3ROak8zM05vSmUyV2pnQ0FBMU9sU0FIc2xqU1VHTVN6RzJiMkI2V2tuU3FNZVcySjIyQ2VXYTJ4ZTBHdkUreUhpZlpGQzlNM3R0aTkwQnRpTmdsNklucThKQWJKUlBJTW90RUdvcVJSVStTRjZpUUdtRzJMMkZVQVJGVzFBR21LMUtzU2lncWRBRU1xVHlvR24xa2k1eWs4bzBvQUFBQUFFdk9mRGJuM2RiZ0tma0FadHNTK3F0MWkvUUVXOEpPaTlLSkx0OE5NVHRzQmk5dGF6ZTBHcDFQc2l6cUpPZ1ZpOXRzVlFqYkRZSmZDWmxibittYlpVRlNxYkoyb3psOWtkT0VzaUNSVWlpbC9wak1idlRNRVZscGtXaTRpNXhvaVdJdjRBRWlvbzJsNEpXcjBscVNNYTFLeTBLcUFDc2VhMHhvTkpxYlVCclliR1FHdGk3R0FIVFBoZnVJQTBNZ0YxbTYxejdtL0lNelJkSmVRVDZYazA4Z0ZtL3dDdjQvaGZ3Y2V3SGowL2xKMHQvbEpvS3cyelF6QytGakxVK3dhbmQrbUwyMTZmTFBrR2pOdjBlTldkZmxRUzh4UzlJTXhVaWlzYXNSWjdDTk1Ocy9ZdERhR2FJYlJBRk5FN0JlMStCSUM0cHNUZCtnWEEwMmRBdDZ2MDV0VzcybVFEZ3lKbEFYRXlycTZEQTN3WkFGRkJBQUdmdG9CbmttdEFNOGlnR21tS0JlcCtXZGJRR2RHa0JsVDhnTmVueWx6d3NqTmdEY1kxb0drdlNKUVJZWjhyL3dCLytnbjZhenpHOVp1Z3M1TGR3UUZXWDRNbmlydndCdnd6VXQrRHNCcVRKcWNlNjI4QWlRMVlDRVd4T2dYREZXU0E1alZpQUdpQXZCaUFISnRYVFlEUUFBQUJ5QUlwZ0FpZ0lwK3ljKzRLaW9BQnlBSEtnc1p4UUV4UUFBQVJRRUFCQ2NMZ0FvQU00MEFucGlnQ1ltTkFKZVRGUUJZaWdBQWhpZ000amFZREkxaVdBMEFBQUJXUUJvQUFBRlFBU0tBQ2VRQlZBQkFBQUFBQUFBQUFBQkZBQUFBQUFBQkFBOHFBQUFDQUJTQUF2Z0FmLzlrPSIgLz4KPC9zdmc+	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Feuerwehrfest-Aigen-im-Ennstal_ev_25521953	market	f	t	\N	025, 0.08.2025	2025-08-28 11:08:48.640544	2025-08-28 11:08:48.640544
59	schladming_ev_14601521	Pfandlfest der FF Mandling-Pichl	Unser traditionelles Pfandlfest der FF Mandling-Pichl inkl. Steyr-Daimler-Puch Geländewagentreffen findet 2025 am Samstag, 30. August ab ca. 17:00 Uhr statt.&nbsp;Es spielt die Trachtenmusikkapelle Pichl und anschließend die „Zwoazylinda“.\n\nTraditionell werden in der Riesenpfanne (2,30 m Durchmesser) wieder kulinarische Köstlichkeiten angeboten.\nEintritt € 5,00.\n\nDie freiwillige Feuerwehr Mandling-Pichl freut sich auf Deinen Besuch!\n\n7. Mandlinger Steyr-Daimler-Puch Geländewagentreffen\nStartgeld € 40, Anmeldungen an sdptreffen@kfz-schlager.at\nab 10 Uhr Treffpunkt beim Hotel Taferne in Mandling\n12 Uhr Gemeinsame Ausfahrt\n17 Uhr Siegerehrung beim Festzelt\n\n&nbsp;\n	Rüsthaus Mandling	2025-08-29 11:11:01.289	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/08%20-%20August/image-thumb__173547__masonry/17174-pfandl_fest_12.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Pfandlfest-der-FF-Mandling-Pichl_ev_14601521	market	f	t	\N	025, sdptreffen@kfz-schlager.at, 0.08.2025	2025-08-28 11:08:48.641294	2025-08-28 11:08:48.641294
60	schladming_ev_25099844	Balladen, Balladen, Balladen	Ein Abend voller Poesie, Spannung und Gefühl erwartet dich&nbsp;im stimmungsvollen Pfarrhof auf der Pürgg. Unter dem Titel „Balladen, Balladen, Balladen“ präsentiert Herr Balluch ein einzigartiges literarisches Erlebnis: Aus über 60 Balladen kann das Publikum vor Ort auswählen – und Herr Balluch trägt die gewünschten Werke frei aus dem Gedächtnis vor.\n\nEin lebendiger Abend voller Klassiker, Überraschungen und Emotionen – lass dich&nbsp;von der Kraft der Sprache und der besonderen Atmosphäre verzaubern.\n\nEintritt: Freiwillige Spende\nMit deiner&nbsp;Spende unterstützt du&nbsp;die&nbsp;Renovierung der historischen Katharinenkapelle in der Pfarrkirche Pürgg.\n\nWeitere Informationen:\n📞 +43 664 3846217\n🌐 www.pfarrhof-pürgg.at\n📧 info@pfarrhof-pürgg.at\n	Pfarrhof Pürgg	2025-08-29 11:11:02.971	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI3MCIgdmlld0JveD0iMCAwIDQwMCAyNzAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRU9BWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNjUUFRRUJBQUVDQlFNRkFRQUFBQUFBQUFBQkVURWhVUUpCWVhHQmtjSHdFcUd4MGVIeC84UUFGQUVCQUFBQUFBQUFBQUFBQUFBQUFBQUFBUC9FQUJRUkFRQUFBQUFBQUFBQUFBQUFBQUFBQUFELzJnQU1Bd0VBQWhFREVRQS9BTWdBQUFBQUNLQUNBb0FBQUFBQUFBSUFBQUFBQUFBQXE0c2dNbU9tSURBdGlBZ3RRQlFBQUFFVUFBQkZBUlVBVUFBQUFBQUFFVkZBQUFBQUFBQUFBQVJRRUFBRlFBQUJxTXRRR29xS0FLQWpGblgzZEdmRlBQc0RLS0F5b0FBQUFBQUFBQWlvb0FBQUFBaWdJcUFLZ0NvQUtBQUFBSW9BQUNLQWlnQWlvQUFDMVlpd0dvdXhrNkEybFNWYUF0NnhtUm9ISlkxWnRaQkx5QUFBQUFBQUFBQ0tpZ0FBQUFBQUlxQUFBS2lnQUFBQUFBQUFBQUFBSW9BaWdCT1VBZEV3aThnamJIVnNBQUMzSEpyeGVYeXlBQUFBQUFBQUFBQUlvQUFBQUFBQ0tBZ0FLSW9BQUFxNERKamVMSURHSTZ1ZDVvSUFBQUFBQUFDQ29EVXJVWWpjQTROOUY1QU9xZ0RQaVlkUEZ4WE1BUlFBQUFBQUFBQUFBQUFBQUFBQUFFVUFBQUFCcU5Zekd3QUFHUEZ5MjUyNkNBQUFBQUFBQUlvQ05SQ0ExSzFyS3lRRjFVNlJtK0xzQjRyNWZWa0FBQUFBQUFBQUFBQUFBQUFBQUFBQVJRQWsxckl6T2xkUEtBeG1KSTNnQ3cwaTRETzA2OTF5bUFlVEY1ZEdQRnlESUFBQUFBQUFBSUNvQUx0TnZkQUFBQUFBRkJGQUFSUUFBQUFBQUFBQUFBQUFBQUFHdkRmSmtuSU9qTFRJTlJXVkJRVFFYWjNZOFdmS3NVQUVCUkZBQUFCQUFBQUFBQUFBQWF3RUZ4UFlBQUVVQUZRQUZRQUFBQUFBQUFBQUFBQUFHcFNzckwzQmRWRUJxMHhsWUNzTjNoZ0JBQUFCVUFBQUFBQVZBQUFGRm5tQ3lZdnVtNHp5QzI2QUNVV29DS2lnQ0tBdktBQXRRQUFBQUFBQUFBQUFBQUFEY05BQTBRRlFBQUFBQUFBQUFBQVVBRVVBRmtNK3JjbmNFeldPSFcyUnl0MjZDaWFBQUFBQWdBS0lvTEVGQkFBQUFBQUFBQUFBQUFBQUFFVUJGRUFBQUJRUVZBQUFGUUJSRkFOd0xQciswQnVkV3VJNUxiMHdDM1VBQUFBQUFBRUZRRkVBVlVBVkZLQ0FBQUFBQUFBQUFBQUFBSXFBcUNnZ0FDb29JQUFBQXFBS2NrbSszZGQ4cHgvUHVCeDBuemY2OUVBQUFBQUFBQUFBWEVvQ05aMlFFQUJSRkJSRkJBQUFBQUFBQUFBQUFBQUFBUlVVRUJRUlVVRUFBQUFXVHp2SDgvbmRjem5udC9mOUp5QmJ2MmdpZ0FBQUFBQUNLQlpoNWZLMlo4a3p6QlpjUzZpN3ZRRFBPVmMyZXFabnlRRVJielVBQUJRQUFBQUFBQUFBQUFBQUFBQUFRVkFVRUFBQUJjMEVhNDkvNC8xTnpqNXY5ZWlBQUFLaWdBQUM1YnhDVEx0QnFlR2VmTE5salhXOEpmVUVrN25INTkxTDMrS0RJTDB6ODBDVDgvMVBNWG40L2NEZDkwNG9BWHJVVkFBQVVBQUFBQUFBQUFBQUFBQUFBWDUrNmRQVUJGNmVwbmEvWUFBQkJaTy9BRWh2bERsQUFBQUFCY1hJQ0xnb0U4V2RHK2xqQjRkNzlBYjRPUm1kT24wOWdhU3plUDhBclBpdkIrb0dRQUFBQVFBQUFBRkFBREFBQUFBQUZCQUFBT1BmOC9OQTl6Zmd5MXFUT1FUUFV6MU0yN3FXNkM1NnBoTGkrZWdtOS9xRnp5QUpQTXQxZDNwZWpJS2pVdG5sK1ZPdEJCckZCbk83UjVleEFFVUErNGNkS1c5QVpyZmgyTVJmMUE2TTNvenVKdWdXNklvQUFBSUNvcUFBQUtnQ2dBb0tETzAyOTFNQk52YzMyK2dnTHZvdXoxWkFYcDN2MC8wNmV2OEFDQUxxRFhobjdBc21kYlU4VjFxczlNNDNlL29DVG1MWlo3TjVNNmROaVRwYytRU1Rwd20rVStxK0s3Y1pBRnRNNlMzOWdTOSsvUHYvQUx5dWRHdUV2RkF6MWd6NXRmOEFBQkYrd0c5VTRUZXlBdW9BTGJ2dWdBQUFBQUtBSUtBZ3FBQUFBQUtnQ2dBLy85az0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Balladen-Balladen-Balladen_ev_25099844	general	f	t	\N	+43 664 3846217, Web: rgg.atwww.pfarrhof, 0.08.2025	2025-08-28 11:08:48.641978	2025-08-28 11:08:48.641978
62	schladming_ev_24885273	Flohmarkt für Groß und Klein	Herzliche Einladung zum Flohmarkt für Groß und Klein!\n\nBeginn: 09:00 Uhr\nOrt: Kindergarten Haus im Ennstal\n\nViele bunte Stände warten auf euch – kommt vorbei, stöbert, schmökert und genießt das fröhliche Miteinander!\n\nFür kleine Leckereien ist selbstverständlich gesorgt.\n\nWir freuen uns auf euren Besuch!\n\n\n\n&nbsp;\n	Kindergarten Haus im Ennstal	2025-08-29 11:11:07.779	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDQwMCAyNjciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUxBWkFEQVNJQUFoRUJBeEVCLzhRQUh3QUFBUVVCQVFFQkFRRUFBQUFBQUFBQUFBRUNBd1FGQmdjSUNRb0wvOFFBdFJBQUFnRURBd0lFQXdVRkJBUUFBQUY5QVFJREFBUVJCUkloTVVFR0UxRmhCeUp4RkRLQmthRUlJMEt4d1JWUzBmQWtNMkp5Z2drS0ZoY1lHUm9sSmljb0tTbzBOVFkzT0RrNlEwUkZSa2RJU1VwVFZGVldWMWhaV21Oa1pXWm5hR2xxYzNSMWRuZDRlWHFEaElXR2g0aUppcEtUbEpXV2w1aVptcUtqcEtXbXA2aXBxckt6dExXMnQ3aTV1c0xEeE1YR3g4akp5dExUMU5YVzE5aloydUhpNCtUbDV1Zm82ZXJ4OHZQMDlmYjMrUG42LzhRQUh3RUFBd0VCQVFFQkFRRUJBUUFBQUFBQUFBRUNBd1FGQmdjSUNRb0wvOFFBdFJFQUFnRUNCQVFEQkFjRkJBUUFBUUozQUFFQ0F4RUVCU0V4QmhKQlVRZGhjUk1pTW9FSUZFS1JvYkhCQ1NNelV2QVZZbkxSQ2hZa05PRWw4UmNZR1JvbUp5Z3BLalUyTnpnNU9rTkVSVVpIU0VsS1UxUlZWbGRZV1ZwalpHVm1aMmhwYW5OMGRYWjNlSGw2Z29PRWhZYUhpSW1La3BPVWxaYVhtSm1hb3FPa3BhYW5xS21xc3JPMHRiYTN1TG02d3NQRXhjYkh5TW5LMHRQVTFkYlgyTm5hNHVQazVlYm42T25xOHZQMDlmYjMrUG42LzlvQURBTUJBQUlSQXhFQVB3QmxGR2FLQUZIV2tOSGVsTkFCU0duVWhvQUtRMDdGTk5BQzBocGFRMEFMU0hyUzBob0FXazcwdWFUdlFBdElLV2dVQUo2MG9GSHJRS0FFTkx6UWFXZ0Jvb05LT3RLYUFFenhSbmlseHhRQlFBQTBtYUFPVFIzb0FXbkNtQ25pZ0JhV2t6Um1tSVdpa3pTWm9HT29wdWFNMEFPb3BtYU0wQU9velRNMFpvQWRta3pUYVNrQXVhS1Nsb0FLU2xwS0FGb05GQm9BU2xwS1dnQXBLV2twQUZKUzBVd0NsTklhV2dBRklhVVVHZ0JjMDA5YWRpbTk2QUhVMDB0SlFBNm1uclM1cE85QURxYjNwYzBnb0FVMENnMERwUUFkcUFLTzFBb0FRMHRCN1V0QUNDZzBvcEQxRkFDNW9CNG9QU2p0UUFnTkxTZHFVVUFJQnpUdWxKM3BhQUROSlJSUUFVVVVVQUZGRkpRQXRGSlJRQXRKUlJRQVVVdEZBQ1V0SlMwQUpTVTZpZ0Fvb29vQVNpbG9vQVNrcGFTZ0JLS1dnVUFGS0tRMHVLQUVIZWxOSjNwVFFBdWFiM3BhVHZRQTZrNzBjMG5lZ0IxTjcwdWFUdlFBdElLWE5Bb0FEUjJwRFMwQUJGR0tDYVdnQnVPYVUwRHJRYUFBQ2p2VHUxSUtBRU9hRFM5NkQxb0FDS0FLUW1sRkFBS1drSFdsb0FTaWlpZ0FwS1dpZ0JLS1dpZ0Fvb29vQUtLS0tBQ2lpaWdBb3BhU2dBb29vb0FLS0tTZ0JhS1Npa0F0SlJSVEFLYlMwQ2dBcGFRMHRBQ2Q2VWlrRkxtZ0FGSGVnVUhyUUF0SjNvcE85QURxYUtYTklLQUZOQW9ORkFCM3BhYjNwYzBBQjYwdEozb0pvQVVDakZGTFNBVEZMaWlnbWdCTVVsTG5pa3BnTFNpa29Bb0FYdlFhTWMwaG9BVE5HYVNrb0FmUzAybG9BS0tXa3BERXBhU2xvQUtLV2tvRUZGRkZBQlJSUlFBbEZMU1VBTFNVdEpUQUtLS0tRd29vb29FTnAxSWFCVEFLWE5KM3BhQUVGS2FRVXBvQUFLUTBvTkJvQU0wZDZXazcwQUxTRHJSelNEclFBNDBVaG9GQUFPdExTZDZXZ0JCMW9ORkxTQVdscHB6UzVOQUJRYUtLQUNtOTZXa3BnT3BCeFNVVUFPenpTR2x4U0dnQnRGTFMwQUpSUzBVQUxSUlJTR0pTMGxMVEVMU1VVVUFKUzBVdElZbEpTMGxNUVVVVXRBQ1VVVVVBSlMwVW1hUUJRYVdrcGdKUlJSUUFEclM0cHRPenhRQUNnOUtCUVJRQUFjVWhGS0tRMEFMU2Q2V2s3MEFPcEIxb3BPOUFEcVFVVUNnQlRTMG5OQXBBRkxTVTZnWWxMUlJRQVlvb0ZKaWdRbEZHS1dnQk1VdExSUU1LRFJSUUEyaWxvcGlDa3BhS0FDaWxvcERFcGFLV21JU2twMUpRd0VwYUtYRkF4S1NuWW94UUliUlQ4Q2t3S0FHVVUvYlRkcG9BU20wN3BTWm9BQnhTR2x6U2NVQUxSUlJTR0ZKaWxvb0VJS1UwbEdhWUNpa05MU0dnQjFJUnpTMG5lZ0JjVTN2VHFUdlFBVUNuVTBVQUxTQ2x4U0FVQU9velNZb0ZJQmU5R2FUdlJRQXVlOUpSUlFBdldseFNVdEF4YUtLS0FDaWlpZ0J0RkZMVEVKUlMwVUFGRkZMU0dGRkxSVEVKUmlsb29BS0tLS1FCUlJSUUFVVVVVQUZGRkZBQlRTdExSUUJHVklwTVZMVFNLQUcwVVVVRENpZzBVQUZHS0tLQUNrTkxSUUlNMGQ2T0tTbUE2a0hXak5JRHpRQTZrRkdhQlFBcE5JRFNrMGdvQVVtak5KUlFBVXRKUzBnRE5BcEtjS1lDVTRVbExTQWRSU1V0QXdvb29vQVEwbExSVEVKUlJSUUFVdEpTMGhpMFVVVUNDaWlpZ1lVVVVVQUZGRkZBQlJSUlFBbEZGRkFCUlJSUUFsTFNVVUFNb3BLS0FGb29vb0FLS0tLQUNpbHBLQUNqRkxTVUFGR01VdEZBQ2RhS1hGSmcwQ0VwYUtLQUNqdlFLS0FDbG9wS0FDblUwVStnQTRwY1UybHpRTVdscHVhVUhOQUMwVWxGQUMwbExSUUliUlMwbEFCU2lrcDFBd29vb29BS0tLS0FDaWlpZ0Fvb29vQUtLS1NnQmFTaWlnQXBLV2tvQUtLS0tBRzVwdEthTVV4QlJRYUtBQ2xwdExta01Xa29vb0FLV2lpZ0Fvb29vQVdpaWlnQXBLV2lnQk1VdUtiMHBjMEFITkdEUzVwdWFBRkFwVFNDbG9BUHBSU1pvb0FLV2tvb0FjRFMwek5GQUQ2S1FVVWdGcEtLS1lDaWxwS0tBRm9vb29BS0tLS0FFb29vb0FLS0tLQUZwS0tLQUNpaWlnQXBLV2tvQUtLS0tBSTZNMGxGTVF0TFRhV2dBNjBVVVVBRkxTQ2x6UUF0RkZGSVlVVVVVQUxSU1VVQUZHYVNpZ0E2MGxMUzBBTnpTMHA2VTNCb0FjS0tTaWdCYUtRVXRBQlJSUlFBVVVVaE5BQ2lsNHBtYVhORmdIWm96VGFjQlFJZFJSUlFNS1drb29BS0tLS0FDaWlpZ0Fvb29vQUtTaWlnQmFTaWlnQW9vb29BS0tLS0FJNktkaWpGQURjVVlwMUhGQURjVVlwM0ZKUUFtS0tXak5BQzBVbWFLQUZvb3BLQUNpa29vQUtLV2tOQUMwVWdwYUFFb0F6UlNpbUlNVVU2aWtNYlJTNG94NjBBSlJUdHRMZ1V3R1VsUHdNVkhRSUtjUFNrcFJRQTdHS0tCMG9KcEFPb3BCUzBEQ2lpaWdBb3BDYVNnQmMwVVVVQUxTVVVVQUZGRkZBQlJTVVVBTFNVVVVBRkZGRkFEYUtiUlFJV2lrb3BnTG1pa29vQUtLS0tBQ2x6U1VVQU9wS1Nsb0FLS0tLQmkwbEZGSUJLV2tvcGlGcHdwdEtLQUhVVVVVQUxSU1V0QUJSUlJRQVV3OEduMHhxQUVwMmVLYlJRQTZpa3AxSUJBYWRURFNnMERIVVVVVUFKMU5MU0Nsb0FLS0tLQUNpa29vQVdrb29vQUtLS0tBQ2lpaWdBcEtLS0FHVVV0SlRFRkZMU1VBRkZGTGlnQktLV2tvQUtLS0tBQ2lpaWdBb29vb0FLS0tLQUZvb29vQUtVVWxMUUE2aWlpZ0FwYVNpZ0JhS0tLQUdrMG1hZFRLQUNpaWlnQXB3cGxPQm9BVTBsRkpTQVVHblUyaWdCYVdrbzZVREZvb29vQUtLS0tBR21nVXRKUUF0TFNVVUFGRkZGQUJSUlNVQUppakZMU1pwaUZ4NjBsTG5yU1VnQ2twYUtZQ1VVdEZBQ1VVVVVBRkZMU1VBRkZGRkFCUlJSUUF0RkZGQUJTMGxMUUE2aWlpZ0Fvb29vQUtLS0tBQ21VNG5GTm9BU2xBcEtXZ0JLVVVsRkFEczBVbExRQWxMU1VVZ0ZwYVNpZ0IxRkpSUUF0RkZGQUJTVXRKUU1LS0tLQUNpaWlnQktLS0tCQ1VVVVV3Q2tvb29BS0tXaWdBcEtLS0FDaWlpZ0JhU2xwS0FDaWlpZ0Fvb29vQVdpa3BhQUNscHRPRkFEcUtLS0FDaWlrTkFDWnBLS01HZ1lacEtkaW0wQ0NpaWxvQVNpbG94UUFDbG94UmlnQXBLV2tvQUtXa29wQUxSUlJRQXRMVGFXZ0Fvb29vR0ZGRkZBQlJSUlFBbEZGRkFodEthU2wvd3BnSlJSUlFBVVVVVUFGRkxTVUFGRkZGQUJSUlJRQVVVVVVBRkZGRkFCUlJTMEFKVGhUYWVLQUNpaWlnQXBLVTAyZ2FGSHJUcVNpZ1FVeW4weWdBb29vb0FmUlJSUUF0SlJSUUFVMmxvTkFEYVdpaWdBb3BhS1FCUlJSUUF0RkpSUUF0RkZKUUF0RkpSUUFsRkZGQUgvMlE9PSIgLz4KPC9zdmc+	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Flohmarkt-fuer-Gross-und-Klein_ev_24885273	market	f	t	\N	025, 022, 08.2025	2025-08-28 11:08:48.644113	2025-08-28 11:08:48.644113
63	schladming_ev_2257094	Traditioneller Frühschoppen mit den "Hochgrössen Buam"	Die Schafalm lädt jeden Sonntag im Sommer ab 11:00 Uhr zum traditionellen Frühschoppen mit uriger LIVE-Musik!Gerhard, Harti &amp; Elias - sind drei leidenschaftliche Musiker und stehen mit "zehn" Instrumenten LIVE auf der Bühne und begeistern jedes Publikum von jung bis alt.Unsere stimmungsvollen Musikgruppen sorgen für gute Laune und echten Hörgenuss, passend dazu servieren wir regionale Köstlichkeiten und zapffrisches Schladminger Bier.Tischreservierungen sind über die Homepage "www.schafalm.at" oder via E-Mail unter info@schafalm.at möglich!#netmuhsondernmääh	Anreise Die Schafalm ist mit der Planai 10-er Gondel am einfachsten erreichbar, alternativ kann die Schafalm auch mit dem PKW über die kostenpflichtige Planaistraße (13km lang) erreicht werden.Die Sei	2025-08-29 11:11:09.226	\N	https://www.schladming-dachstein.at/Easy-Edit-Mode/info%40schafalm.at/Events/2020-06-08-5ede398900c7f-2229627/gallery/image-thumb__221255__masonry/1834384328-BM7Y2948.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Traditioneller-Fruehschoppen-mit-den-Hochgroessen-Buam_ev_2257094	general	f	t	\N	048970, +43 3687 24600, info@schafalm.at, 24600info@schafalm.atwww.schafalm.at	2025-08-28 11:08:48.64503	2025-08-28 11:08:48.64503
64	schladming_ev_25661751	Berggottesdienst am Riesachsee	Herzliche Einladung zum Evangelischen Berggottesdienst auf der Gfölleralm am Riesachsee\n\nGerne laden wir Euch&nbsp;am Sonntag, den 31. August 2025 um 13:00 Uhr zum Evangelischen Berggottesdienst auf der Gfölleralm am Riesachsee ein.\n\nGenießt mit uns gemeinsam einen besonderen Gottesdienst inmitten der wunderbaren Bergwelt der Schladminger Tauern. Umgeben von der beeindruckenden Naturkulisse des Riesachsees wollen wir innehalten, zur Ruhe kommen, danken und beten.\n\nWir freuen uns auf zahlreiche Besucher:innen!\n\n\n	Gfölleralm	2025-08-29 11:11:11.086	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2MCIgdmlld0JveD0iMCAwIDQwMCA1NjAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBSXdBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUMwUUFRQUNBQVFGQlFBQ0F3RUFBd0FBQUFBQkVRSWhNVUZSWVhHQjhCS1JvYkhCMGVFaU12RkNVb0xpLzhRQUZRRUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFBSC94QUFXRVFFQkFRQUFBQUFBQUFBQUFBQUFBQUFBQVVILzJnQU1Bd0VBQWhFREVRQS9BS0lvQUlDZ0lvQUFBQUFBQUFBSUFLQUFBTFFJTFJRSXRLQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQXdMdWdLQ0FzQ0FLQWdBQ2dBQXFxaVVvQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUF6SVZYUlFaVW9uejlCSUZyeitsb0V1QzRYSUJCYVVHVnBVdlhLY2dVU0p0UUFBQVNKdmozQlJKbWxBQkltd1VBQUdiNVNEUWx4RVdvQUpNMXRJS0FBQ1JOZ29BQUFBQUFBQUFBQUFBQUFKeStCUG40VDU4MytRVy9QaGQvUExUenAxNGtjbytRYVFLOHNGRTgxTDgvbVA0QlFBR2M3bXEyMTZOSld1YzVnbW1IdjhBcEYzRmVybmExbFdwWE9aQkttNnVhcS8rRlRFWnpsZnd0WjNja3hZSkhXYzlJbGYvQUZQU0N0N2xLNXlCTzgzS3pPWHQ4bFh2TkZkWmdFcVltS25yY2xYTTU3N2RGcm5NOEN0YzV6QkxtdWQxOGtYZS9PMXJLdFN1Y3lDc3hlVjZWNWJUUHA1eUMxbGxNeEZFWnhIT0N1ZFFWVzhnem5WM09Xbjk4V3Awbm9sWlZjclhPUU51ek1iYTY1M3BuMWFybk13VnprRTFtYzVpcTBJakxGbk91cTF6bUNJcmptQ1QvckUzTjVFM2xVOGowODU1Y2xyVE9jZ1NNcHE1bkxkTDF6bTd5aHFzN3VXWXlqV1luaFg5QTFHVWNWU0xyTlFBQUFBQUFBQUFBR2E4elg5Tit3SlV5djM1UnVlZWRRWE5QT0pDZ21mbjlIZjRPbXFna0tBQUFBTVZHdTBiOFovZ0d4bXY4dXNaKzVFZjdSdGY0RFE1MXBybkV6cndialNPa0FUTTNWZkpFenBNYlhyYVRkNVRXVW5DSjRBME1iVEc5K2ZDekdrUnRuWC9BRUdobU40K0VyS1o2MXlvR3htZHZtdWhFYXpubG9EU1RNeHRseHY4WnJLNno0MnM2ZXdOSkUzdFN6RnN4ck1kUG9HaGlydks4K05UQnI2WTJyM29HeU00dG1JcVp6N2NFaVA4YjNyMkJzWm5PWWlyeTQwUkdzYmNMQm9Zci9HOStMWUFBQUFBQUFBQUFBQUp4NkcvYUR6K1A1Ti9OOUFKODkxU2Zzano4QTg5OHlqK1A1VUU4eTgranlmeitGU2dVQUFBQm4weHo5MmdFbUlrOU1LQW5wanlWaUtBRXFKei9TSWlORkFTb3U5eW9sUUVxRDB4VlorNmdNekdtdFJ3bk1pNzNpTjduOGFBVDB4NXA3SHBpZVB1b0NWSFAzUFRIa3FBbnBqeVNvVUJLanpYM0tpcS9WQVNvS2ozOTFBVDB4VlorNmdBQUFBQUFBQUFBQUFDZENzdk5WQVRXWTg4MUo0bEtDYjl2MVVpRkFabkZYVnB4a0hTNXE4cTROTWYrT3pVYVIwZ0ZBQUVtWWpWUUFBQUFBQUFBQVpqRmMxUU5DVE5SYVJpdllHZ0FBQUFBQnltWm1mcGNkNVJ5K1FkQm5EZFp0QUFBQUFBQURFNDZtcWJBQUFBQUFBQUFBQUFBY3AxbnE2dWMvN1NCaHczcm8xL3JNY0orREJwM01XbmNDY1ZaUnFYaXE1OW5QOEFaZGRkY280Y2VvTXpubkdtL091Q3hpaWVKaW1vNnN4dlBDSnJ1RFU0cXlqT1U5V1djZEdQMldzZTBjZ2JpYmkyWng4SVp1ZlRYTmNPc2NnYTlVUnJHZTZ6TVJGdVdMV2Vxek01Y0t5QmZWTTNwVUxHSzVxakQvckxHR0xrRzhVemxIRk1NVGM4c2tuL0FHbHZEcDF6Qm1ibWE0TGh2Vm5lWjV0emxoOW9CSnhUcERXY1ZlZHVlSFdNbStjNjdSR2ZuVURGaXJLRmliaTNQRnJmSHZUV0hGbFU5Z1hGaXJLTlVtWnJPczJOWjZ0WTlvQk1PYzlHcHhUY3hsa21EZVdkZThnNjNsYk1UaW1jc2t4YlJ0RUxodXBxTit3TE9LWWllTVRTUmltZXUzbkl4UldIdXpnMTdBMTZwaWFuTnFacUxjOFdzOVd0Y05mZjRCaHhUTXJpbVloaUpyUDNYRk4xd0JLMDV1ckdIZmxrMkFBQUFBQUFBQUFBQUE1NG9tN2gwQVl3M0dWUzFFVHJQYU9DZ09mcG1KdU0yODk4bzRmeW9ET0tKbU10bWNNVG5GYTd1Z0RsNlppZExNVTNMcE9ubTdHTFdJamFLQllpOFBkSXVKMGJpS2lJSjFqMzg2YWc1VHJMcE1YREZYaTd1b09kWXFxbThNVjFVQm5GaHZPQ0lyV2Y2YUFZbkRjM0MxbFV5MEF4RVRFOGU3VlROM092d29ERTZWNmMvTnpEaHJPV3dHUFJ3bWljTjc5YjNiQVNJcUtZOU14T1ZPZ0RFNGIzeldJbUlxdTdRQ1RHVk1ZWW1KMGRBSEwwei9iZFZPbC9jVTBBNXhobVowcUc1aTRyMlVCaU1NeHJQczJBQUFBQUFBQUFBQUFBQUFBQUFBQUFDVkViS0FGWHFBSkVSR2lnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNUTlFDak56RXhFMU44R2dCbVptTTRxbWdBQUFKeXpBR2Y4cXZMb3NUY1JJS01YT2N4VlJzdDZaYXdEUWtUTXhkVlBOSW1icWEwdklHaEp2YXU1RTNBS0FBQUFETTNGemxRTkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFKaTBWSml3WjBxb3FwalBSWmpPSjNzcTlaV1l5MXpqY0VtTTRubVlvalhuQjZaMXZNbUpuZjRCclJuRnAxbWxpOTVzbUx5Qm5GaGlJeVhGckVhOGowek9zK2Mxcm5uRzRKV2NWRXh4NkpNWnhXVjNiVlR2TjEyU3B1NytBSXcxTnhwd1hGcEtnSnRsd1NNNHpQVHRjMXdXcGlLaVFUREgzSkVlcTVualJFVEcrWEJhM2lhNGdrWlRNYlZaLzZqb1ZWNTV6dVZOMzZzK2dOTTRkTzhsWXYvbDhGVEcvd0Nhek54TTUwc1JyRlpjMXJlSnJpVnJubk8vOUF6R0hPZUVUb1RGWWF2ZFlpWW5WWmkrd002VmxXZXZIczFPazlFcTlaa21KNDVkQVdOSTZReFdVOHBxR29pWTN5NkhwMXoxbTlBSWlwbU9qU1ZOM2FnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRFBxdlNNbzVyZVZnb3o2dVU4bW9tNHNEUkxqakJpMGxtWncxVWE3WkEySlBTWjZKaDAzMTNCb1NaMmlMTDEyclVGR2ZWT3RaZFZtYXJtQ2lST2RURkV6blVSZkVGR1ltTVZ4WFpJbkxLSm10UWJFdUt0TG5lUGtHaEpuYUl1U0o0eFVnb3pjN1JsNW8xRTJBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREdWWnpQU01zK3hmK1BhbXdHTGkvOEE2cmgwaG9CbkZNVVRWUk1iUzBBbHhycDFaaVl6NnRnTWJ6Y3pGNlZvc1ZuTVhPV3M2TkFNWGhyS1pqbEZrN1hsbG4xL0d3R0xpSmljNTF6MTlsdXBtOTg0YUFaaVl6blRueE1NeFRRREZ4NmVQSDNNdHBtK0dmNjJBeE90ek14RXhyQ3hWNVRNNWE3TkFNUlZaek1URzEvVFVhYjkxQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUzQvNW1DaVh5TG5oOC8wQ2lYUENQZitpNTRmSUtKZkc0VUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUN3QUxBQUFBQUFBQUFBQVNacnJ3Sm5hTmZycW5reUIxOW84elg0QUFBQUFCUGlmUE0xQUxyWDMvbitWUk5OTlBycC9BTkRLQTJNMkEwTTNKWU5ETnlnTldXeUExWmJJRFZsc2dMWmFBTFphQUNvQ3FJQUFJQUFDb0FzUzB3M0NvQUFBQUFBSk03UnI5RXpTZmM2K2ZFQWVUS2dBQUFBQUFBQUFBRE9tY2FmUTB6cDAyQUFSUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFzRlFiWWFqTFgzL24rUVUxU2RKNkpwbnR2L1BZR2dBQUFUZnA5LzBKR25YTlFFdk9waFdNV3NXRFpxeGluVGhMVWFRQ3BjWFJNKzdHSDZnSFFaOVdWMXV0d0NqTTRvcTlWdk91Vmdva1RjV21HNXNHa3JiMlVCa041ODFBQUFGRUFWRkFBVUFFRnlLZ0FLZ3FCUVNvS2hRRXFDb1VCS2dxRlFDb0tnVUdaWi90dVdBWDlhNU0vdjNzMXJBSExsbDV5SS9JSnpqbkJzQkgxOWJHdWZzbThkTSsyaThnVkowbm9xVHBQUURoMEFBWW1KbWMyd0dadzNWYkxuZktsU2RBT3ZaSXc2ODhqRE9XZXhFek04SUJQVE5WbHFURXhjOFlsWm1hNkpkNGZnQ01OeEMxTnpKaDBhQm1NT3ZQek5ZaVlqTlFBQUdaMTdCT3NkRUJWUUJVVkFBRkZFVVFBQUFCUkFGQUFBQUFBQUFsbFpSRldONGxZeXk5dWhScjFnRDlJME5pSjFqbklHL1kyNi9TYnp6MFhYUDIvbitBVkowbm9xVHBQU1FQNEU0ZEZBQUFaeFRzMEF4LzVYRGxIZG9xT0FNVE9WYitTMUVSVktWSEFHSjFpbXlvallBQUFBQm1kWTZJczY5a0FWQUZWQUZRdFFRQUZFRlJRQlFBUVZBQUFCVUFVUUFsRmtqcjdJcTMyNm5QeVQzK0VxZlBLK2dPZDFIMmNjK2VYc25YUzllZjlyTlpYZWYwQk4vOG5OcTJkN21kUG1DSzRkTC9BQUdnQVovSlVuS2I0NVQrQUFBQklTQ1RPVnFtZkpZQkxuTFRNaWZjcjRLbmxyWUZ3cWNkRkFBQUJKMDV6NThBenY1c0xTVUFBQXFBS0lvS2dvSUtVQ0tVZ0tJb0FxQUFvSUtBZ0lBMURLeE8xQTBsOFBmYisreFhIK3ZPcHYwekJNNmpodWJhNlRXeTFtekZURlZkU0M3OGVmWXo0eGQzMGc1MWx3NWYxd1dvMjg3Z29BRFBMZU5PZm03U1RGZ0NmZjJvQUFBQUFBQUFBSDBDZlNjL0lYWHB0L1lDQUFVQUNDMFQxQkFBRlJRVUFGQUFCUVJRQUJRWlJ0aWJCQUFGajdaVUdyNEVhOVlWSjI5dmNEYm5NcHBmREwvcTcrL3ljZXdDUmxwN2Z4L0M2VDVwL1JHdmFQMEZBQUFCSmkwNjVUOXRNeUNqTnpIUDdXNDZBb0FBQUFuV1V2aEFMMTg4NEpkenk4MVp6M1dwZ0doRlFLWjVOTSttUVdGemdpS053S2xLYVFFb2FSUm1TQ2FTQWFWbFFWVUtCYkVBVVFvR2hFQnRHVE1DWWhLVUJLRlJCc1ozeTNhVVNMM1RlZXVGcG5mdkgwQ3lrYjltZ0FBQUFCbWRXbVoxQkFFVXlNdWZ1VWtpSHY3bWZOWVNaa0Zqb3ViS3hjZ1ZlN2RKU3FNMW1XMWNRek9LT0FLakZ5dnFrRnRXVmlKa0ZzN0dVVFM2OUFTdWFXc3N3Q1NMSnNBdkJtRzBFbklKelVCSlZtUVdDMFVGUS9RRkVBQUFSVVZSZk8wcnArL2tvdXNmQUt6djNqNmFobmZ2K0EwQUFBQUFBekxUSUlBaWxzdFVreUlFb3VZR1hFMHp0S2twUnIxY2k1bEZzRXFlRFZkaTVac0ZxRVFCcUZZaHF3TzZvVEtCMVNGdUtaVVdXb2pKbm0wZ1ZFRloyS0NGS2xnbTZHNEF0MmlLS1dpb0FFZ1dHU1dvc05NdzBDd2NldjhBYVF1L2I2LzZCeDl6ZnY4QWh3N3diOTQrZ1ZKNGQ1L0ZTUHZNRkFBQUFZYllBQVJRcFFRWmFLQmthU2daTFdnR29tUCtrekhWaVZVSzRvdEZJQzJBQ1RxVVRxQVJGclNnbEtnQ2dBV3lzb0FnU0FTQ2lLaWdLeW9BS0JDZ0N4cXM3ZWFwR3JVZ2svc1NiOTROZThKLytRV2Zzbjd5Tit4dkh1Q2dBQUFrNk10VG95QUFpaW9JZ3FBS2dLS2diZ2xLaWdvaWdpS1VDUXBRQ29xQWdBS0lvSWN5VUFWRkFTUlpVWlZHcXlCa1dZUUZoVUFXTlZTRkEzYllhanp6NUE4N1NuSHJIMnMrZEU0OUkrSkJkNTdSK2tjZk1rL1puNS9xR2dBQUFBU1dXcFpBQVJRUlJBQUFRQlVBQUFGMUVPQUtBQ3NxZ0tpZ0lRS0Fpa2dNcWdDaHVBckt3QWlvQ29DZ0FDeHFxUW9DeHA1ckFSdjJrR3RXT1BUejZhLzZUSHpFd0NSNTNMbStWMTBXTkRqMWtGQUFBbVFTV1Y5WEdFdmxBQTFoejJoa0FCQUFCa2FxQ2xFRm9RWlZRRUZBUlFCQlFCRkFSUUFBQkJRRVJvcUFaa2FLaFJCYUVHUm9VWkdxQVNCUUJxTlk3eCtzcitUQUwrZlJPM1dGU2RQYjdBalE0OVNQMmZzM250OUFxb1ROQW1LYTAxSjBTWmlWeXFnWU5scWdWckRwTEs0U3BFUVdpZ1FXcEtCQlNwRlFXcFFBV3BLa1JCYVdnWkdxaGFnR0J1b0FZRzZBWVdwYUFZR3dHQnNCZ2JTZ1pHcWhKZ0VBUlFCUUFBQUFCcUJDTklrMm56bWNZNDZmcCt4NTlnUittODlqRHA3Ry9ZRlp4Yk5NNHRnWkZpTGxyV0o1U0JyRERjYU0wazBYRHEwemgxYVVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFFcUZBS2dBQUFCT1hsS2dIM0hueWNPdjJyUEdPOEFzYitibTg5SS9Valh6ZUxYajFnRlRGc3FUc0J2MjRwRzN6MUltMUFZYW5LR1VtaldIVnBuRHJMU2dBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ2JlYWs3VHoremZyOS8yY1lCSTE2ZWZVckg3TXB3bmpIekdadDhlOGcwemkwaHBKaTRCekd2UnpYMDh3U2RrcVc1aXlNUE1nbUdKaVdnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBVDdqNVZKK1FUOG0rMG44L2hQL2ZPV3ZRalcrVi9RTkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWt4dzFaMjk0ODZOczR2T29QLzJRPT0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Berggottesdienst-am-Riesachsee_ev_25661751	nature	f	t	\N	025, 08.2025	2025-08-28 11:08:48.64575	2025-08-28 11:08:48.64575
65	schladming_ev_24262084	Gröbminger Kulturmontag	BlechReiz BrassQuintett "Quintessenz"\n\n\n\tPeter Kosz (Trompete)\n\tNico Samitz (Trompete)\n\tHannes Burgstaller (Horn)\n\tDavid Zuder (Posaune)\n\tMartin Kohlweis (Tuba)\n\n\nEintritt: VVK 20.- / AK € 25.-\n\n5-Tageskarte: € 85.-\n\n\n	Kino Gröbming	2025-08-29 11:11:14.132	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NiIgdmlld0JveD0iMCAwIDQwMCAyNjYiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUtBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNjUUFRRUJBQUlDQUFVRUF3RUFBQUFBQUFBQkVTRXhRVkVDWVhHQjhCS1JvZEV5c2NIaC84UUFGUUVCQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUgveEFBV0VRRUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFSSC8yZ0FNQXdFQUFoRURFUUEvQU5YNFpWQUJGWjhnb0FBQ0FBS0FBTS9GMG9ERTdiYytxNktnemVXbWJ3aXN0ZkRmRExjek5WRmM3MjZNMmVoU2RMcG1SRUZUekFCcEtRczBHRzl5Sko3WEZHT3hxejBtVVJvVVJYTnRpdHpwVVVCRkFBQUFBQUUxV2FDNUZBQUVCc1kyKzAyK3dkRXJQNnFmcUJvWTJtMzJEWTU3Zlp0OXFqb09lMzJtMzJEb09lMzJiZllPZzU3Zlp0OWd0bkxVbU1iZlp0OWc2RG50OW0zMkRlVDBybnQ5bTMyRG9PZTMyYmZZT2pMTzMyYmZZTkluUHpYN2cwcm56N09SWFFjOUJIUWN3SFFjd0c4Z3dBNkRtQTZEbUE2RGtBNmptQTZJd2JSVzFjOVZCc1NvQ29xVkZFVVZFQUJLaTFGUVZBRlJVQlVVQkZSUVFWQUFBQUFBQWF3UUJjU2dBQUNBb0FBSUFBQ2dnQUFBQUtDQUFOc3FsV05JQ0tvQUlBcUlBQ1ZGcUtncUtBaW9DZ0Fpb29DQUNvQUFBQUFDb29BQUFBQUFBQUFBSXFLQ0FBQUFLaWdJQUtxS2l4UUVWUUFRQlJBQkVxTFVWQlVBQUFGUUFWQUFBQUFBQUFBQUFGRVVBQUFBQUFBQUVWQUFBQUFBQUFBQnBscEZVRlJRQUVBQkFGUktpMUZRQmJBUUFBQUZCZjdCQmZ6L0FHQ3NnQ0FBQXFBQTFZRElBS2dBQ29BQUFBQUFBQzRDQzhJQUxGc0JrQUJwbHBGVlVWRkVBQUJSQUJFcUxVVkdwUFBndlBFYXYrTSt6UG1mVUdSZk5BUUZ3RCtsL3Y4QXBQNlgrLzhBcUtmbit6OC9nL1A5bjUvb0dSVVZGRDJnTmVDMWtGWE9OVzJIakVFTHdqVlRnRUdwQ3pBSWxhMzVHOFppS3dLaW9BQUFBcTFJb3BPMHZaMENJMzQreVM0djZxaXNDb3FEVExTS3FzMU5wZzBBQUlBQXVUM0FacU5HQTEvbE9PNHlUWjB0c3Z5dmxVUzk3REZ6eVJGWjh0emlmbjNUc3UvWUUzUkZ5emxSYkR3ZGwzMGdubEYreVo4bEJGNUJBV1RPMVJVRXZhS05SYko0T3VLcUJPa3VLelFXWWxpeitDN091Z1JiRXFBc2lYaHZtWDdNOTFSa0FSWXNTTDBLWVo4d3ZDQzVVdkFVQy9GOHAreksxRlFhWmFGaFdXcXlJMmhxSXE2Z0tBTllCRjZ2QkoxUkEvVmZmOEorcSsxeUo4VkJNdFB6V2tBM0UybG56TE1CRy84QUtmTmhzR1oxMmJmZFcvSk1CQVBLb0xPK2ZDM0pFOW9xM05UaEJSYnpuMEpPWXM2VGNvTmZGT1U0OWt1OSttUWFSYUlKd3U1TEVxS2dUdUtnTjNzbVhuOTJaenFJcUNpb3NhNzRpZUQ0YmlLZk5MeVh2WWdLTGhuSUplbVhTeG1TZFhnR1dsc2s4c2d0UnBNZ0lDNENMOWhRSXZQWDVFbkVTYnlDMnBwbnBNVVZGT0VEVGhiMU9QQlBoQTROL3dERXpuRnRCT2ZzY2ZWYmVHUWFuTXAyazRhbmtHY1d5VFA1UFAxUzc1QXQzMnV5ZUdZdGdMM2gwUktDNm05NlE3b0xDblhYbEFOTlFWR29sbmxyd25pb3BNTEdWbm9Ga3hQSmkrUVN6Rlc1ak0rbWcxNDRUT05hOE1BMXhqR0wydGxCS2N3K2F5NkM3N1JNVzVBTTRNUHF2WGpqODdCTVBUVXc5ZmRCZ1hFcWpXUmgwbk1UOU04MVVTODRiblJzUkZYbnN3a3RXM3hmM0JtbzBubjZndmZiVEo0QmVPZmJEUm5IekVSYk1JVzZLUW03NjFJc0E4L1M4SmJyV2ZuNTdaVkNjVlU2UUJmMDFHL2g4MEVrenluZEVCckx2clBKejlmbWhvcXpQS2J5aWlMem4vVVhiMGlDNTJTWlQ0YVR1K3dXczJOY3hPK2hVK0dhMVpuZk5TY2VXdjhBS2ZNUm5mejg5dFpuTis3UFdUeTM4VnlBelp6d0cveml6bi9uNThoV2JMbi9BQm5jZFhPektJTEl5cy8wSzFKenY3TGJHTGI0VHNHejB6Q2d1c3I1UlVKYkY3N3FBTHdDQTNMSk8wK0x4V0c3bVNBZUl0bkgwVDZDS2hRa1ZHdmg2K2RaM2c2U2d1b0tCbUxKNXZTM015czhvTlhubUptVzc0L0luSzMxOTcrZkpWWitaaWdpTmRmREVXK3ZrREtMVUJyQnJmaDlWbTlnWWVWOFZBWE41bjNuOU0xZHd2UE0vWUVqVjFNdjBVRjhUVE1sMWRtUmkxRk9xZWRUdFZScjlYdExkclBEVStpQzhWcjB6dUcraFdxeGUxMzVzM3NHc2w2UkpjQUVCVUl0N1JhQW5sUUVJb2lpS2lvQVlBc2xURmx3VnF5ZUdUU29Hb2J3S2dhTEFScWZrL3BQcTM4TWlCeFB1ejhXTDhUSW9hZ3FLWHNOQkJBR3AwZ0FBQTErZE5TeU1hZ3JyYytyTmw4UlBocTI4SU1GTkZSRklBZVd0WlVWZUVRQVdJQ0JDTGdDWW9pb3RRcW8wSUlxNFlpZ1l6bktpb2thKzZJQlZ4RjBGU3FXSXJLZ3FHQWdDeTRpNEIyTGdpb2pTS2lLdUdBd0tUdUFEZDYrVElHR0FCaGhxb3FkSXVJcUFLQmhnSUlxcUt5aTlvcUFjZ0xPMnRZVkZhNFRJZ0M4SmV3QUFWQUFBQUVVQURRQUFRQUFCUVZJY3RhQW43aWdKaTVCcmdHU3RjSURIdjZMOFBhZS9vdnc5S2pWNllhVG1lSWlwaGhxS2pYQWtWRlJGRlJLc0FBQkZGRUJSQUFBQUFBQUFBRTAxQlVYVFVBWFRVQVhUYWlnR2dBSUFwcUFMcHRRQmRwdDlvQTNMd3JLb3FxeWFEUldOQVJxYWhxb3ZJZ2lnQ29LaW9yTlJxc3FnQUFBQUFBQUFBQUFBQUFBQ2hPMW9NZ0FMaU5Yb0dWUUFBQUFBVkdvREl0N1FCWk5ScjRld1JBQUFBQUFBQUFBQUFBQVhFVUVBQVdJc0JCYjJnQ3hGZ0NMZTBBVkZuWUNMVUFCWUQvLzJRPT0iIC8+Cjwvc3ZnPg==	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Groebminger-Kulturmontag_ev_24262084	culture	f	t	\N	+43 676 6366842, 025, 6366842vierglas.kultur@gmail.com, 01.09.2025	2025-08-28 11:08:48.646997	2025-08-28 11:08:48.646997
66	schladming_ev_23192504	Tanzabende - Häuserl im Wald	Alle&nbsp;Tanzbegeisterten sind herzlich willkommen!\n\nInfos unter: www.tanzandmore.at\n\nEintritt frei!\n\n\n\n&nbsp;\n	Häuserl im Wald - Mitterberg	2025-08-29 11:11:15.381	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE5MSIgdmlld0JveD0iMCAwIDQwMCAxOTEiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBQy9BWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNJUUFRRUJBQUlDQWdJREFRQUFBQUFBQUFBQkVURkJBaUZSWVlId2NjSFJrZi9FQUJZQkFRRUJBQUFBQUFBQUFBQUFBQUFBQUFBQkF2L0VBQllSQVFFQkFBQUFBQUFBQUFBQUFBQUFBQUFCRWYvYUFBd0RBUUFDRVFNUkFEOEE1Z0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFPczhjL2xqeG0xMVNqTml5Q2lzNHkybEJFRUFRRkVBRUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBWEFRYXdCZkh0cG1OVGhGS29tQXFLZ0pXV2tCRWFNQmtVVkdRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBYWtYRm5xS2lzNHVLdFFaa1drU3hSZFZQU2dJcUFnQXBGT0NmSWpOWlc4bUF5S2lvQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE2S3pGbDFGYVRTcGdLSmwvYW9ING41TStsQUVFRkVBRXUxdmlZU2Z2d1VSbVFyV1lZRG1qZDVURkdRQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCVVdBM0Y5UkZ0UlUzMnNUMThWUlZRb0M2enBpWUFLQWpVUlVBRUVXa01GRGdWQVRubGl6SFJtKzFSZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJxSTFFVlMrNHFiMGd6dmxmV3RSTStsa1ZUdFVWQUNuSWpQYWxpNEtSUVZFUnBNUUlLS0lvZ0NWUUdMR1c2eXFJQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDcmhGUmNNVUVVUUtvMXNOU0VtVVJVNFVCRmtEUURVMFJXaElxb0FBbC9zTC9aMkNnZ0NXNm9ES05WbXFNaW9JQUFBQUFBQUFBQUFBQUFBQUFBQUFOUmxZTEdsWnhVVlFFRW9WcFJJMGdJQUFGSVhld1FGa1JWZ0NvcUt5QmVFL3hwbjkvd0Nnb29DQUFueXpXa29Nb3RSVUFBQUFBQUFBQUFBQUFBQUFBQUFBRldlTy93QUdleFZpb3JLZ0FxVnBtOE5UaFVWRkJFT3hBVyt1QXJJSzFHV2tWUEtxbG1xcUt6OW1nS3plVlNncXBPRkFSVUFacW9ETlJVVkFBQUFBQUFBQUFBQUFBQUFBQUFBRmxzYm4zNlNUUGRYZFJZV2lVbEZVQkFUeHZ2Rlo3VWRFVUVRQUVNVkFhVm5WMEJPVVVEL0NCMkFBQk9WWjdhQkFBRXFwMERMTFZaVkFBQUFBQUFBQUFBQUFBQUFBQUJ1U2V1MkYzQWF1MW52OHRTckoyaXJXRzJPeFdnRUJPVlR0UnFVU2VnRkNBZ0FBejNyVFBhaXpQYXNkdHhBQUFRcWFvZHRzTlQzRUZCQUdXa0Jtb3RSVVFBQUFBQUFBQUFBQUFBQUFBQUFBRmpvNXhxZWtxeHBtdE1VR2hBVUFRVUVCWXFLcUNBQ3MvQ29vdnlKS0lLSjlnRlFGQnJ4NFlkQkJGRVZNU3FsQmtCVVFWQUFBZi8vWiIgLz4KPC9zdmc+	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Tanzabende-Haeuserl-im-Wald_ev_23192504	general	f	t	\N	+43 3685 22280, 22280hotel@haeuserlimwald.at, Web: haeuserlimwald.at, 22280hotel@haeuserlimwald.athttps	2025-08-28 11:08:48.648108	2025-08-28 11:08:48.648108
67	schladming_ev_14279800	Schuhplattlerabend in der Erlebniswelt Stocker	Von Juli bis September erwartet dich jeden Mittwoch ein echtes Stück gelebter Tradition: Tanz- und Plattlergruppen aus der Region zeigen ihr Können und sorgen gemeinsam mit Harmonikaspiel und Humor für einen unterhaltsamen Abend in gemütlicher Atmosphäre.\n\nTermine &amp; Gruppen:\n\n\n\t23.&nbsp;Juli: Tanzgruppe d’Freistoana aus Gröbming\n\t30.&nbsp;Juli: Schuhplattler d’Hahnl Stoana von der Kleinsölk\n\t06.&nbsp;August: Tanzgruppe d’Freistoana aus Gröbming\n\t13.&nbsp;August: Schuhplattler/Tanzgruppe d’Dochstoana aus Schladming\n\t20.&nbsp;August: Musikkapelle Pichl – Dämmerschoppen (findet bei jeder Witterung statt!)\n\t27.&nbsp;August: Tanzgruppe d’Freistoana aus Gröbming\n\t03. September: Schuhplattler/Tanzgruppe d’Dochstoana aus Schladming\n\t10.&nbsp;September: Schuhplattler d’Hahnl Stoana aus Kleinsölk\n\t17. September: Schuplattler/Tanzgruppe d'Dochstiana aus Schladming\n\t24.&nbsp;September: Tanzgruppe d’Freistoana aus Gröbming\n\n\nRESTAURANTBETRIEB in Restaurant Dorfstöckl\n\nProgrammablauf:\nFreu dich auf lebendige Brauchtumsdarbietungen, 2–3 flotte Harmonika-Stücke sowie Witz und Charme bei der Vorstellung der Gruppen. Jede Woche ein neues Highlight – zum Zuschauen, Mitklatschen und Staunen.\n\nWo &amp; Wann:\nBei jeder Witterung\nJuli &amp; August: Open Air (bei Schlechtwetter in der Knappenalm)\nSeptember: Knappenalm – öffentlich zugänglich für alle Gäste\n\nBesonderes Highlight bei Terminen in der Knappenalm:\nZusätzlich zum Bühnenprogramm erwarten dich der stimmungsvolle Knappenfilm, die eindrucksvolle Blitz &amp; Donner Show sowie die sagenhafte Giglachsage – ein Erlebnis für Groß &amp; Klein!\n\nKosten:\nBei Open Air Freier Eintritt\nBei Schlechtwetter in der Knappenalm: Brauchtumsbeitrag 5€ mit Sommercard, 10€ ohne Sommercard\n\n&nbsp;\n\n*Änderungen sind&nbsp;vorbehalten*\n	Erlebniswelt Stocker	2025-08-29 11:11:17.824	\N	https://www.schladming-dachstein.at/Events/Schladming/Schladming-Rohrmoos-Pichl/07%20-%20Juli/image-thumb__2567400__masonry/Schuhplattlerabend%20%202025.png	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Schuhplattlerabend-in-der-Erlebniswelt-Stocker_ev_14279800	general	f	t	\N	+43 3687 61301, 025, 61301info@erlebniswelt.at, 03.09.2025	2025-08-28 11:08:48.6489	2025-08-28 11:08:48.6489
68	schladming_ev_24645315	Heimatabend – Volksmusik trifft Gedichte von Peter Rosegger	"Musik: FLAUTINOS (Blockflöten-Ensemble), Lesung: Siegfried Steiner"\n\nPremiere der diesjährigen Literaturkonzerte in der Evangelischen Kirche in Ramsau. Unter dem Titel „Mein Name ist Mensch, meine Losung ist Fried“ (von Peter Rosegger) liest Sigfried Steiner Gedichte des bekannten Heimatdichters Peter Rosegger, dem „Rilke“ der Steiermark. Die Lesungen werden musikalisch begleitet von dem Blockflöten-Ensemble FLAUTINOS.\n\nErleben Sie sich zum Abschluss des Tages die einzigartige Kultur des Ennstals und der Steiermark. Für Seele und Gemüt.\n\nZeit: 20:15 Uhr, Dauer 1 Stunde\n\nDer Eintritt ist frei!\n\nEin Angebot der Evangelischen Tourismusseelsorge der Evangelischen Kirche in Deutschland (EKD) in Zusammenarbeit mit der Evangelischen Pfarrgemeinde A.B. Ramsau a.D., dem Tourismusverband Schladming-Dachstein und der Ramsauer Verkehrsbetriebe mit Unterstützung des Kulturausschusses der Gemeinde Ramsau a.D.\n\nNach der Veranstaltung steht der Tourismusseelsorger der EKD, P. Will, noch für ein persönliches Gespräch zur Verfügung.\n\nKostproben der Gedichte von Peter Rosegger \n\nEin bisschen mehr… \n\nEin bisschen mehr Friede\nund weniger Streit,\nein bisschen mehr Güte\nund weniger Neid,\nein bisschen mehr Liebe\nund weniger Hass,\nein bisschen mehr Wahrheit,\ndas wär doch schon was. \n\nStatt so viel Hast\nein bisschen mehr Ruh’.\nStatt immer nur ich\nein bisschen mehr Du! \n\nStatt Angst und Hemmungen\nein bisschen mehr Mut\nund Kraft zum Handeln,\ndas wäre gut. \n\nKein Trübsinn und Dunkel,\nmehr Freude und Licht.\nKein quälend Verlangen,\nein froher Verzicht\nund viel mehr Blumen\nso lange es geht,\nnicht erst auf Gräbern,\nda blühn sie zu spät!\n\n&nbsp;\n\nIst der Mensch nicht wie die Schwalbe?\n\nIst der Mensch nicht wie die Schwalbe?\nMit dem Lenze fliegt er an\nund verjubelt einen Frühling;\n— heißer Sommer quält den Mann.\nWie die Schwalbe an dem Neste,\nbaut er flink an seinem Glück,\nmuss um seine Reiser, Blätter\nringen mit dem Missgeschick.\n\nLeise kommt der Herbst geschlichen;\nvon des Lebens reifem Baum\nreißt der Sturm die Frucht des Schaffens,\nund der Mensch erwacht vom Traum.\n\nSieh', am Scheitel seines Hauptes\nwird es weiß — der erste Schnee;\nmatt und düster blickt das Auge,\nach, es friert der klare See.\n\nUnd er fühlt ein eigen Heimweh,\nfremd wird ihm die Bruderhand;\nwie im Herbst die Schwalbe, zieht er\nheim ins ewige Frühlingsland.\n\n\n	Evangelische Pfarrkirche Ramsau	2025-08-29 11:11:19.489	\N	https://www.schladming-dachstein.at/Events/Ramsau-am-Dachstein/Sommer/Peter%20WIll/image-thumb__2555050__masonry/Plakat%20Rosegger%20Ramsau%202025%20A4.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Heimatabend-Volksmusik-trifft-Gedichte-von-Peter-Rosegger_ev_24645315	music	f	t	\N	025, Willpw@praedi.de, willpw@praedi.de, 03.09.2025	2025-08-28 11:08:48.649842	2025-08-28 11:08:48.649842
48	schladming_ev_17754646	Yoga Retreat - Relax and Move	Ein Yoga Retreat, das Bewegung und Entspannung vereint.\n\nErlebe in dir die Balance von Aktivität und Ruhe auf unserem „Relax and Move“ Yoga Retreat. Inmitten der sommerlichen Berglandschaft begleite ich, Dominique, dich auf dieser Reise, um die perfekte Harmonie zwischen Bewegung und Entspannung zu finden.\n\nWorauf du dich freuen kannst\n\n\n\tAsanas (Körperhaltungen), Pranayama (Atemübungen) und Meditation\n\tEntspannende und dynamische Yoga-Einheiten\n\tBergfahrt mit Lift\n\tYoga in der Natur\n\tFinnische Sauna und Wellness\n\n\n\nWas du benötigst:\n\n\n\tYoga-Matte und Meditations-Kissen\n\tAngenehme Sportbekleidung für Indoor und Outdoor\n\tTrinkflasche\n\tStift zum Schreiben\n\n\n\nPreis pro Person 320,- (ohne Übernachtung)&nbsp;\n\nInfos und Anmeldung unter T +43 664 914 02 19 oder info@dominiquegreger.com\n	Anreise Den genauen Anreiseweg findest Du hier: In Google Maps anzeigen	2025-08-29 11:10:32.882	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2NCIgdmlld0JveD0iMCAwIDQwMCAyNjQiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIj4KCTxmaWx0ZXIgaWQ9ImJsdXIiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIDIwIiBlZGdlTW9kZT0iZHVwbGljYXRlIiAvPgogICAgPGZlQ29tcG9uZW50VHJhbnNmZXI+CiAgICAgIDxmZUZ1bmNBIHR5cGU9ImRpc2NyZXRlIiB0YWJsZVZhbHVlcz0iMSAxIiAvPgogICAgPC9mZUNvbXBvbmVudFRyYW5zZmVyPgogIDwvZmlsdGVyPgogICAgPGltYWdlIGZpbHRlcj0idXJsKCNibHVyKSIgeD0iMCIgeT0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9qcGc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQVAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzJ3QkRBZi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vd0FBUkNBRUlBWkFEQVNJQUFoRUJBeEVCLzhRQUZ3QUJBUUVCQUFBQUFBQUFBQUFBQUFBQUFBRUNBLy9FQUNrUUFRRUJBQUlCQkFFRUFnSURBQUFBQUFBQkVTRXhRUUpSWVhHQkVwR3g4S0hCSXVFeVF0SC94QUFXQVFFQkFRQUFBQUFBQUFBQUFBQUFBQUFBQVFML3hBQVdFUUVCQVFBQUFBQUFBQUFBQUFBQUFBQUFBUkgvMmdBTUF3RUFBaEVERVFBL0FNQUFBQUFBQUFBQUFBQUFBQUNvQUFBQUFzUUJ2SVgwa3UvYlc0aXVlY25EVnJLb0l2MnVBY1o5cngrZjcybXBiNGdJZ3VBZ3VBQUFBQUNLQWdvQ0FBQUFBQW9BQ29BcUtBZ0FBQUFBQUFBQUFBQUFBQUFBQzZuYWdLbVZBWC9Zc251bEJCZXY3L3BBUnFWbFFhU28xd2d6cU5ZV1NLSnFMSnBnQUFBQUFBQUtDWXFvQ0FBQW9DS0FJcUFBQUFBQUFBQUFvSUFBRFVtZk4rQVJjaDEvZktjMEQ2S2RFbEFTUnJvMy9BTDlKYm4ybHAzUVRzQUVGQUYxQUYybWNMK09Tb0lxR2lJSXZ5cWhnMERPRFNBazdhU1JRQ3FJTUFLQ29vQUFDS2dLaWdJS2dBQUtnQUFBQUFOYjE0WkFWcnBnMEdyV2Q1NVJxUUd0bDFtMWJjWkFBQUd1SXoyQUtVRVhhZ0RhSnFvSm5KY1ZMSjJDTGVraTN3b3kxR1ZnTkNvZ0trVUFGQnpBVVVBQkZBQUFBQUVVQVJVQUFBQUFBQUFBQUFYZUVLQUFBRVBJRFVuWHRTUzl4cis0RFA2ZVpDem5qdzM1MDhmelVIT0l0endpZ3U4WWhnSGxjSkcwR1dXckdjQkJSUlpXbUdwVURwZmxEcjZCVk96b0hNRlVBQUVVQVJRQUFFVUFBQVFBQUFBQUFBQWFrMWNCbnFmZjhJMVpxZEFnQUFBT2t5UldmVG41WHUvWGFVVkpmQmxXK21ZU0t6NnQ0NitHYTNtNHhaNThLaVJwbFVGSlVCR3Q5MDZEc1ZMRU1XQWdJbzFxc0tEVTR1ZUswekwrOFhVR1VCUlFBQUFBQUFRRkVVQUVBQUFBQUFBQUIwZ2tYVVZXYm5zdkdhZHhCaW8xZm44TXRJQUFyV3llblBmdGdCMlM4ekdadmpwcEtKUGs5VzlZTlVnNGkzdEZGRUJCWWpVc0ZXeG0wdDU0THp5Z3lBb0FvTDZXNzdzeTg1RnZuNlFZRlJRVUFBQUFBRVZBQUFBQUFBQUFBQUFBYW5Tc3hZaXRaMHFVM1VFKzJXcmZDWW95QXFBQU4rbStMV3Qxem5KTFlEci9BS1o5WFhIOWpNdHR0WHhmcEJpVFN0NSt6Q2dBQUJsb0JMaS9wcGs5d1NvMWs5eko3Z2d1SmxCZlQyMXM1WUFBQVVSUUFBQUFCQUZRQUFBQVVERFBsdTVJek1CRWFzbU02QUtnQ29BNlNjR2ZKc1JsU3hpdHNWWUFDb0FvTmVtY2ZiTjRyWHB2ZzlTRE0vMDZUcHpubHVkVVZQVmZEQlJVRm5wdCtJMWs5UGZOOWt0dEEvNHo1TGF5QUM1VEFRWEo3bVQzQkYybUpsQmVMMlorVUFBQUFBQUFWQUFBQUFBQUFWQUdxazdBVXY4QUtMT1Z3R1FCQW5LMkpBYloyOUwrVTdRV2V5MmYzKyt6TFV1Z3dOV0pKeW9aWWpWak9XQTNQZjhBZjcvN1BWekU5UGx2dEZZamNURkJqTzR2L2o5cmVPZkxDb0lOeVp6ZjJCSk4rSWNUcjk3L0FQQzNVUlMxQUJSRkFOUUJlUHBNVVZFQUFCUVFBQUFBQUFBQUFBQUFBRm5iYkRXenlnVmhxM1dSUVdUWWxtS2dzOTJWQmV5ZG8xRUdoTjhGNDU4ZVFYR2JjWDlVWXUrUWJqVFBwNi9LOUNtdE9kYjZ5QW5xL3dCdWJwWnN4bVFRa3ptL2hOMWF5S29nRFdWbDBsNExKbkNhT1lDZ0FBcUFBQ29LZ0FBQUFBQUFBQUxtdGZwOXdZRzhrVGdHUmVEQVFBQTBBSmNhM1dRRnNSWlZ5VUJMVXpCQmUrLzNiYzJwZkNpV1lqZmJBTnl6RlluOFZkaUJPZlYva3QwbkV0WlVibExlR1lXb29pb0FzNVJ2MCs0TEppLzRaMWQ4SU1JdDdSUlVBQUJRRkJFQUFBQUFBQlFRQUhXY1F0WjlOOE5XSU9hbVo0UUYrVUQ3VVh1ZkxMYzV1enBiNlo3NERtTlgwNThzZ0FBRzRBTjdxV010YURJMG1ld05TNmxtcFBab0dCYkVCci8xKzZ5MTRqSUxFV2VVQUFCZStHdW96TzJtYXA1Vk41VUQ3VGl3TGNCbW91MUZBQUdrRlZFQUFBQXdBQUY4QWlLQU5UMWU3SURweFdNeERhQTFJenZ3YlFkTFo2ZUdmMWU3QURldzJNQU5aS2ZwK1dUUVg5Tk12c2JWMEdScll2SHdETXFxSUlxS0tWaXpHNEtpZUl5MWV2cXNnczhvczdFVkZpQU5UdFdaV3IwbEdmSzdrd1NxTnptTTIrR1FCUUFwNE8xQVFGUlVBQUFBQUFBQUFBeHZNakhZSEF1ZEplUU8rTU1YT1BtSUI1TzFab0xpTHFBQUFBQUM0dGdFclVjK2E2ZW1jY2dubGFVMFU2akxWWnk5QW52RUp3dEVSYWpYajYvaEJrVUZScWRmbGxxRkdzWjlTNmx5b01pOENnQUFLZ0NvS2lvQUFBQUFBQUN6dUlBMzZxeDViN1k1UlZJZC93Q3prQzFNTS83QkYraVNYdEtsN1ViL0FFeE1qSURXUXlNZ05aREUxWmRCVU9mZzg0aWt1TnN5NTN3dEJMVTBxQTJtc3RjS01OVG1mTS9oZGlTOTBRekNMZmZ3SUZqTFdsZ3JDeGNBS3l0QVFBRklqVnZ0d0M4Uk82bmJVQmtCVUFBQUFBQUFBQUFOTmdBc3Z5YUFKZndtZ0FBQ0tBQUFDeXlBQmVldUQrUVFha3p5V3dGVmxBUVZlTzlCUm1kdGNBaUV2aTlBQWxKZkY2QUd0VGdCVXFBQ29DZ3MrUUVYajNOL0FBLy8yUT09IiAvPgo8L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Yoga-Retreat-Relax-and-Move_ev_17754646	wellness	f	t	\N	+43 664 914, 02 19, info@dominiquegreger.com, +43 664 91 40 219	2025-08-28 11:08:48.631626	2025-08-28 11:08:48.631626
49	schladming_ev_453249	Bergwelten Klettersteigcamp in Ramsau am Dachstein	ABGESAGT!\n\nErlebe dein erstes Klettersteig-Abenteuer mit Bergwelten!\n\nBist du bereit, die Faszination des Klettersteigens zu entdecken? Egal ob Anfänger, Fortgeschrittener oder einfach bergbegeistert – die Veranstaltung "Mein erster Klettersteig 2025" bietet dir die perfekte Gelegenheit, in die Welt der Klettersteige einzutauchen.\n\nGekonnt und sicher durch Felswände steigen, wo sonst nur Kletterer unterwegs sind: Möchtest&nbsp;du&nbsp;die Faszination Klettersteig erleben, aber hattest&nbsp;noch&nbsp;nie die Gelegenheit dazu? Du willst das neueste Material unserer Premium Partner testen? Oder willst du&nbsp;dein&nbsp;Können verbessern? Und zwar genau dort, wo 1843 der erste Klettersteig der Alpen errichtet wurde und sich heute ein Klettersteig-Eldorado mit 19 verschiedenen Steigen in unterschiedlichen Schwierigkeitsgraden befindet? Dann bist du&nbsp;beim Bergwelten Klettersteigcamp in Ramsau am Dachsteingenau richtig!&nbsp;Das sichere Begehen von Klettersteigen wird hier an drei Tagen mit unseren Bergführern&nbsp;in Theorie und Praxis vermittelt.\n\nAlle weiteren Informationen sowie das genaue Programm unter:&nbsp;Mein erster Klettersteig 2025 - Bergwelten\n	{"@type":"postalAddress","addressCountry":"AT","addressLocality":"Schladming","postalCode":"8970","streetAddress":"Ramsauerstraße 756","email":"info@schladming-dachstein.at"}	2025-08-29 11:10:35.516	\N	https://www.schladming-dachstein.at/Events/Ramsau-am-Dachstein/Sommer/Klettercamp/image-thumb__730558__masonry/Klettersteigcamp.jpg	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Bergwelten-Klettersteigcamp-in-Ramsau-am-Dachstein_ev_453249	nature	f	t	\N	025, 310info@schladming-dachstein.atwww.bergwelten.com, +43 3687 23 310, 08.2025	2025-08-28 11:08:48.632983	2025-08-28 11:08:48.632983
61	schladming_ev_451662	Ramsauer Airpower	Ramsauer Airpower 2025 – Flugaction &amp; Familienspaß&nbsp;\n\nAm Samstag, den 30. August 2025, heißt es wieder: Abheben über der Ramsau! Die Ramsauer Airpower bringt Action, Spannung und jede Menge Unterhaltung für die ganze Familie – vor der imposanten Kulisse des Dachsteins.\n\nFreu dich auf ein abwechslungsreiches Programm:\n\n\n\t\n\tParagleit-Ziellandebewerb &amp; Heuballenlanden – Präzision &amp; Akrobatik in zwei Durchgängen mit attraktiven Preisen\n\t\n\t\n\tAirshow-Highlights ab 11 Uhr – mit Wingsuit-Sprüngen der Profis Marco Waltenspiel &amp; Peter Salzmann, Fallschirmspringern, Paragleit-Acro &amp; mehr\n\t\n\t\n\tFamilienfreundliches Rahmenprogramm – u. a. Hubschrauberrundflüge, Hüpfburg &amp; Mitmachaktionen für Kinder\n\t\n\t\n\tGroße Sachpreisverlosung ab 19 Uhr – Hauptpreis ohne Anwesenheitspflicht\n\t\n\t\n\tLegendäre Fledermaus-Party ab 21 Uhr – im beheizten Festzelt mit DJ Rossinger\n\t\n\n\nOrganisiert vom Paragleitverein Gamsjaga, steht die Airpower ganz im Zeichen des Sports, der Naturverbundenheit und echter Flugbegeisterung.\n\nOrt:&nbsp;Parkplatz Rittisberg, Ramsau am Dachstein\nDatum: Samstag, 30. August 2025\nEintritt frei – komm vorbei &amp; erlebe den Himmel aus nächster Nähe!\n\nMehr Infos unter findest du hier.\n	Rittisberg Parkplatz	2025-08-29 11:11:04.824	\N	https://www.schladming-dachstein.atdata:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBzbGljZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNDAwIDUzMyI+PGZpbHRlciBpZD0iYiI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMTIiIC8+PC9maWx0ZXI+PHBhdGggZmlsbD0iIzdmN2E2MCIgZD0iTTAgMGgzOTl2NTMzSDB6Ii8+PGcgZmlsdGVyPSJ1cmwoI2IpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxIDEpIHNjYWxlKDIuMDgyMDMpIiBmaWxsLW9wYWNpdHk9Ii41Ij48ZWxsaXBzZSBmaWxsPSIjYjljYmI0IiBjeD0iNTAiIGN5PSI0NSIgcng9IjYyIiByeT0iMTUyIi8+PGVsbGlwc2UgZmlsbD0iIzM5MjkwMCIgcng9IjEiIHJ5PSIxIiB0cmFuc2Zvcm09Im1hdHJpeCgzMS45NTcxMiAzNy40MTY5OCAtNTguMjYyOTIgNDkuNzYxMjQgOTguMyAyMzEuMykiLz48ZWxsaXBzZSBmaWxsPSIjMmQwYzJmIiByeD0iMSIgcnk9IjEiIHRyYW5zZm9ybT0icm90YXRlKDU5LjkgNTIuNSAxNjAuNCkgc2NhbGUoNzEuMDYzMiA0My45ODMyOCkiLz48ZWxsaXBzZSBmaWxsPSIjMjIwYzQxIiByeD0iMSIgcnk9IjEiIHRyYW5zZm9ybT0ibWF0cml4KC0zMS4zMjY4MSAtNTYuODg3NCAxOS40NTE0MyAtMTAuNzExNTMgMTEzIDExOS44KSIvPjxwYXRoIGZpbGw9IiNiY2M5MTIiIGQ9Ik0yMi4yIDE0NC4zbDQ5IDQyLjYtNzUuNCA4Ni44LTQ5LTQyLjZ6Ii8+PHBhdGggZmlsbD0iI2Y1ZWNmZiIgZD0iTTE1MCA4NGwxMCA4Ny0yMS00NHoiLz48ZWxsaXBzZSBmaWxsPSIjZGFlZDg1IiByeD0iMSIgcnk9IjEiIHRyYW5zZm9ybT0ibWF0cml4KC0zMi4wMzQ2NyAxMy43NTE3NyAtNy4wNjUwNSAtMTYuNDU4IDgxLjIgMTcwLjMpIi8+PGVsbGlwc2UgZmlsbD0iIzFjMDAyYiIgcng9IjEiIHJ5PSIxIiB0cmFuc2Zvcm09Im1hdHJpeCg5LjA2NTY1IDIyLjMyNiAtMTIuODIzNDQgNS4yMDcwNiA5Mi41IDEyMy44KSIvPjwvZz48L3N2Zz4=	https://www.schladming-dachstein.at/de/Alle-Veranstaltungen/Ramsauer-Airpower_ev_451662	general	f	t	\N	025, Dachsteininfo@gamsjaga-ramsau.atwww.gamsjaga-ramsau.at, dachsteininfo@gamsjaga-ramsau.atwww.gamsjaga-ramsau.at, 0.08.2025	2025-08-28 11:08:48.642798	2025-08-28 11:08:48.642798
\.


--
-- Data for Name: guest_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guest_sessions (id, guest_id, streaming_service_id, device_id, session_token, login_timestamp, logout_timestamp, auto_logout_scheduled, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guests (id, property_id, first_name, last_name, email, phone, guest_type, party_size, check_in_date, check_out_date, actual_check_in, actual_check_out, special_requests, is_active, created_at, updated_at, guest_labels, notes, name, room_number, status, language, profile_type, adults, children, children_ages, preferences, dietary_restrictions, accessibility_needs, allergies, preferred_activities, budget_preference, special_occasions, profile_completed, profile_completion_percentage) FROM stdin;
3646004e-d23e-46e2-a60a-b8ce7280b3dd	41059600-402d-434e-9b34-2b4821f6e3a4	john	doe	john@example.com		couple	1	2025-08-18 00:00:00+00	2025-08-20 00:00:00+00	\N	2025-08-20 00:00:00.133009+00		f	2025-08-19 13:10:13.64624+00	2025-08-20 00:00:00.133009+00	{family,intense,girls_weekend,boys_weekend,chill}		\N	\N	reserved	en	family	2	0	{}	{}	{}	{}	{}	{}	moderate	\N	f	0
ab9ae41b-4c85-43c8-8762-2cb5c9fd4dab	41059600-402d-434e-9b34-2b4821f6e3a4	John	Doe	john.doe@example.com	(555) 123-4567	family	2	2025-08-20 00:00:00+00	2025-08-25 00:00:00+00	\N	2025-08-25 00:05:00.960116+00		f	2025-08-19 06:52:53.313183+00	2025-08-25 00:05:00.960116+00	{family}		\N	\N	reserved	en	family	2	2	{}	{}	{Vegan}	{}	{}	{Hiking}	Moderate		f	50
\.


--
-- Data for Name: mdm_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mdm_alerts (id, device_id, property_id, alert_type, severity, title, message, metadata, is_resolved, resolved_at, resolved_by, created_at) FROM stdin;
f694d36e-1129-4081-8908-2e3d274d9bc8	9f724aaa-295f-4736-b38a-a226441279ff	41059600-402d-434e-9b34-2b4821f6e3a4	kiosk_enabled	info	Kiosk Mode Enabled	Kiosk mode has been enabled on Living Room Apple TV	{}	f	\N	\N	2025-08-19 11:48:37.248884
\.


--
-- Data for Name: mdm_commands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mdm_commands (id, device_id, property_id, command_type, command_payload, status, priority, created_at, sent_at, acknowledged_at, completed_at, error_message, retry_count, max_retries) FROM stdin;
17138963-b740-4cce-903f-c1824f2c3272	9f724aaa-295f-4736-b38a-a226441279ff	41059600-402d-434e-9b34-2b4821f6e3a4	DeviceInformation	{}	sent	5	2025-08-19 10:52:12.963346	2025-08-19 10:52:13.71789	\N	\N	\N	1	3
47a19778-66ea-4b52-bacb-4d0614a6437d	9f724aaa-295f-4736-b38a-a226441279ff	41059600-402d-434e-9b34-2b4821f6e3a4	EnableKioskMode	{"name": "Entertainment Configuration", "homeApp": "com.chaletmoments.hospitality", "autoReturn": true, "allowedApps": [{"name": "Chalet Moments Hospitality", "enabled": true, "bundleId": "com.chaletmoments.hospitality", "category": "hospitality"}, {"icon": "🎬", "name": "Netflix", "enabled": true, "bundleId": "com.netflix.Netflix", "category": "streaming"}, {"icon": "▶️", "name": "YouTube", "enabled": true, "bundleId": "com.google.ios.youtube", "category": "streaming"}, {"icon": "🏰", "name": "Disney+", "enabled": true, "bundleId": "com.disney.disneyplus", "category": "streaming"}, {"icon": "🍎", "name": "Apple TV+", "enabled": true, "bundleId": "com.apple.tv", "category": "streaming"}, {"icon": "📦", "name": "Amazon Prime Video", "enabled": true, "bundleId": "com.amazon.Prime-Video", "category": "streaming"}, {"icon": "🟢", "name": "Hulu", "enabled": true, "bundleId": "com.hulu.plus", "category": "streaming"}, {"icon": "🎭", "name": "HBO Max", "enabled": true, "bundleId": "com.hbo.hbonow", "category": "streaming"}, {"icon": "🦚", "name": "Peacock", "enabled": true, "bundleId": "com.peacocktv.peacocktvapp", "category": "streaming"}, {"icon": "⛰️", "name": "Paramount+", "enabled": true, "bundleId": "com.paramountplus.app", "category": "streaming"}, {"icon": "🎪", "name": "Showtime", "enabled": true, "bundleId": "com.showtime.standalone", "category": "streaming"}, {"icon": "📺", "name": "Paramount+", "enabled": true, "bundleId": "com.cbs.CBSAllAccess", "category": "streaming"}, {"icon": "🌍", "name": "Discovery+", "enabled": true, "bundleId": "com.discovery.mobile.discoveryplus", "category": "streaming"}, {"icon": "📺", "name": "Joyn", "enabled": true, "bundleId": "de.prosiebensat1digital.seventv", "category": "streaming"}, {"icon": "🌌", "name": "Sky Q", "enabled": true, "bundleId": "com.sky.skyq", "category": "streaming"}, {"icon": "🇬🇧", "name": "BBC iPlayer", "enabled": true, "bundleId": "com.bbc.iplayer", "category": "streaming"}, {"icon": "📺", "name": "ITV Hub", "enabled": true, "bundleId": "uk.co.itv.itvhub", "category": "streaming"}, {"icon": "4️⃣", "name": "All 4", "enabled": true, "bundleId": "com.channel4.channel4", "category": "streaming"}, {"icon": "🇩🇪", "name": "ZDF Mediathek", "enabled": true, "bundleId": "com.zdf.ZDFmediathek", "category": "streaming"}, {"icon": "🇩🇪", "name": "ARD Mediathek", "enabled": true, "bundleId": "de.daserste.Mediathek", "category": "streaming"}, {"icon": "📺", "name": "RTL+", "enabled": true, "bundleId": "com.rtl.rtlplus", "category": "streaming"}, {"icon": "🇫🇷", "name": "myCANAL", "enabled": true, "bundleId": "com.canalplus.mycanal", "category": "streaming"}, {"icon": "🎬", "name": "Rakuten TV", "enabled": true, "bundleId": "com.rakuten.rakutentv", "category": "streaming"}], "returnTimeout": 1800}	sent	8	2025-08-19 11:48:37.243508	2025-08-19 11:48:37.24547	\N	\N	\N	1	3
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.properties (id, name, address, wifi_ssid, wifi_password, welcome_message, house_rules, emergency_contact, checkout_instructions, created_at, updated_at, shop_enabled, guest_profile_config) FROM stdin;
fc8e52df-2896-4cc2-baf7-e81ebec1b35b	Hauser Kaibling Chalet 38					Check-in: 4:00 PM, Check-out: 11:00 AM, Quiet hours: 10:00 PM - 8:00 AM			2025-08-19 12:46:19.582253+00	2025-08-23 18:35:00.884717+00	f	{"enabled": true, "preferences": {"budget": {"label": "Budget Preference", "enabled": true, "options": ["Budget", "Moderate", "Premium", "Luxury"]}, "dietary": {"label": "Dietary Restrictions", "enabled": true, "options": ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Halal", "Kosher", "Nut-Free"]}, "languages": {"label": "Languages", "enabled": true, "options": ["EN", "DE", "FR", "IT", "ES", "NL", "PL", "RU", "ZH", "JA"]}, "activities": {"label": "Preferred Activities", "enabled": true, "options": ["Skiing", "Hiking", "Swimming", "Dining", "Shopping", "Spa", "Tours", "Museums", "Playgrounds", "Family Restaurants", "Kid Activities"]}, "accessibility": {"label": "Accessibility Needs", "enabled": true, "options": ["Wheelchair Access", "Elevator Required", "Ground Floor", "Hearing Assistance", "Visual Assistance"]}}, "party_details": {"pets": {"max": 3, "min": 0, "default": 0, "enabled": false}, "adults": {"max": 10, "min": 1, "default": 2, "enabled": true}, "children": {"max": 10, "min": 0, "default": 0, "enabled": true}}, "profile_types": {"couple": {"icon": "heart.fill", "label": "Couple", "enabled": true, "description": "Romantic experiences for two"}, "family": {"icon": "person.3.fill", "label": "Family", "enabled": true, "description": "Perfect for families with children"}, "business": {"icon": "briefcase.fill", "label": "Business", "enabled": true, "description": "Professional stays with amenities"}, "wellness": {"icon": "leaf.fill", "label": "Wellness", "enabled": true, "description": "Focus on relaxation and health"}, "adventure": {"icon": "figure.hiking", "label": "Adventure", "enabled": true, "description": "Thrill-seekers welcome!"}}, "additional_fields": {"arrival_time": {"type": "time", "label": "Arrival Time", "enabled": false}, "transportation": {"type": "select", "label": "Transportation Method", "enabled": false, "options": ["Car", "Train", "Plane", "Bus"]}, "special_occasions": {"type": "text", "label": "Special Occasions", "enabled": true}}}
41059600-402d-434e-9b34-2b4821f6e3a4	Hauser Kaibling Chalet 20	Ennsling 164, Haus im Ennstal,  8967, 	ChaletGuest	Welcome2024!	Welcome to our luxury mountain chalet! We hope you enjoy your stay in this beautiful location with stunning mountain views.	Check-in: 4:00 PM | Check-out: 11:00 AM\n• No smoking anywhere on the property\n• No pets allowed\n• Maximum occupancy: 8 guests\n• Please remove shoes when entering\n• Quiet hours: 10 PM - 8 AM, Check-out: 11:00 AM\n• No smoking anywhere on the property\n• No pets allowed\n• Maximum occupancy: 8 guests\n• Please remove shoes when entering\n• Quiet hours: 10 PM - 8 AM, Quiet hours: 10 PM - 8 AM, Check-out: 11:00 AM\n• No smoking anywhere on the property\n• No pets allowed\n• Maximum occupancy: 8 guests\n• Please remove shoes when entering\n• 	Emergency: 911 | Property Manager: (555) 123-4567 | After Hours: (555) 987-6543	• Please start dishwasher if used\n• Take out trash to bins outside\n• Turn off all lights and lock all doors\n• Leave keys on kitchen counter\n• Thank you for staying with us!	2025-08-19 06:52:53.313183+00	2025-08-23 18:35:00.884717+00	f	{"enabled": true, "preferences": {"budget": {"label": "Budget Preference", "enabled": true, "options": ["Budget", "Moderate", "Premium", "Luxury"]}, "dietary": {"label": "Dietary Restrictions", "enabled": true, "options": ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Halal", "Kosher", "Nut-Free"]}, "languages": {"label": "Languages", "enabled": true, "options": ["EN", "DE", "FR", "IT", "ES", "NL", "PL", "RU", "ZH", "JA"]}, "activities": {"label": "Preferred Activities", "enabled": true, "options": ["Skiing", "Hiking", "Swimming", "Dining", "Shopping", "Spa", "Tours", "Museums", "Playgrounds", "Family Restaurants", "Kid Activities"]}, "accessibility": {"label": "Accessibility Needs", "enabled": true, "options": ["Wheelchair Access", "Elevator Required", "Ground Floor", "Hearing Assistance", "Visual Assistance"]}}, "party_details": {"pets": {"max": 3, "min": 0, "default": 0, "enabled": false}, "adults": {"max": 10, "min": 1, "default": 2, "enabled": true}, "children": {"max": 10, "min": 0, "default": 0, "enabled": true}}, "profile_types": {"couple": {"icon": "heart.fill", "label": "Couple", "enabled": true, "description": "Romantic experiences for two"}, "family": {"icon": "person.3.fill", "label": "Family", "enabled": true, "description": "Perfect for families with children"}, "business": {"icon": "briefcase.fill", "label": "Business", "enabled": true, "description": "Professional stays with amenities"}, "wellness": {"icon": "leaf.fill", "label": "Wellness", "enabled": true, "description": "Focus on relaxation and health"}, "adventure": {"icon": "figure.hiking", "label": "Adventure", "enabled": true, "description": "Thrill-seekers welcome!"}}, "additional_fields": {"arrival_time": {"type": "time", "label": "Arrival Time", "enabled": false}, "transportation": {"type": "select", "label": "Transportation Method", "enabled": false, "options": ["Car", "Train", "Plane", "Bus"]}, "special_occasions": {"type": "text", "label": "Special Occasions", "enabled": true}}}
\.


--
-- Data for Name: property_information; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_information (id, property_id, category, type, title, description, instructions, icon, url, display_order, is_active, metadata, created_at, updated_at) FROM stdin;
be90b153-50c5-479b-aa2b-71597be891af	41059600-402d-434e-9b34-2b4821f6e3a4	amenity	amenity	WiFi Network	High-speed fiber optic internet throughout the property	Network: ChaletMoments_5G\nPassword: Alpine2024!\nSpeed: 100 Mbps	wifi	\N	1	t	{"speed": "100 Mbps", "network": "ChaletMoments_5G", "password": "Alpine2024!", "subtitle": "High-speed internet"}	2025-08-24 07:01:00.880237+00	2025-08-24 07:01:00.880237+00
d7fdac37-f8c9-4b8b-b5a7-df3d2eebcf3d	41059600-402d-434e-9b34-2b4821f6e3a4	amenity	amenity	Heating System	Modern underfloor heating in all rooms for optimal comfort	Use wall-mounted thermostats in each room. Main control in hallway.	thermometer	\N	2	t	{"type": "Underfloor", "zones": "Individual room control", "subtitle": "Underfloor heating"}	2025-08-24 07:01:00.881812+00	2025-08-24 07:01:00.881812+00
e019bb55-a001-4789-9b87-9e6a027bd1ea	41059600-402d-434e-9b34-2b4821f6e3a4	guide	guide	Fireplace	Cozy wood-burning fireplace in the living room	Firewood is stored outside. Ensure flue is open before lighting.	flame.fill	\N	3	t	{"type": "Wood-burning", "location": "Living room", "subtitle": "Wood-burning fireplace"}	2025-08-24 07:01:00.882514+00	2025-08-24 07:01:00.882514+00
76f475d7-afab-4b3a-833b-457e8061b31e	41059600-402d-434e-9b34-2b4821f6e3a4	service	service	Trash Collection	Weekly trash and recycling collection every Monday morning	Place bins at street by 7 AM Monday. Blue=recycling, black=waste.	trash.fill	\N	4	t	{"day": "Monday", "time": "7:00 AM", "subtitle": "Weekly pickup"}	2025-08-24 07:01:00.883335+00	2025-08-24 07:01:00.883335+00
\.


--
-- Data for Name: push_notification_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_notification_log (id, device_id, notification_type, status, data, created_at) FROM stdin;
\.


--
-- Data for Name: push_notification_queue; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_notification_queue (id, device_id, notification_type, payload, status, priority, retry_count, max_retries, created_at, sent_at, error_message) FROM stdin;
8bbf4bfa-4b5f-4c3f-acd2-8610b95deaa2	9f724aaa-295f-4736-b38a-a226441279ff	mdm_command	{"name": "Entertainment Configuration", "homeApp": "com.chaletmoments.hospitality", "priority": 8, "autoReturn": true, "command_id": "47a19778-66ea-4b52-bacb-4d0614a6437d", "allowedApps": [{"name": "Chalet Moments Hospitality", "enabled": true, "bundleId": "com.chaletmoments.hospitality", "category": "hospitality"}, {"icon": "🎬", "name": "Netflix", "enabled": true, "bundleId": "com.netflix.Netflix", "category": "streaming"}, {"icon": "▶️", "name": "YouTube", "enabled": true, "bundleId": "com.google.ios.youtube", "category": "streaming"}, {"icon": "🏰", "name": "Disney+", "enabled": true, "bundleId": "com.disney.disneyplus", "category": "streaming"}, {"icon": "🍎", "name": "Apple TV+", "enabled": true, "bundleId": "com.apple.tv", "category": "streaming"}, {"icon": "📦", "name": "Amazon Prime Video", "enabled": true, "bundleId": "com.amazon.Prime-Video", "category": "streaming"}, {"icon": "🟢", "name": "Hulu", "enabled": true, "bundleId": "com.hulu.plus", "category": "streaming"}, {"icon": "🎭", "name": "HBO Max", "enabled": true, "bundleId": "com.hbo.hbonow", "category": "streaming"}, {"icon": "🦚", "name": "Peacock", "enabled": true, "bundleId": "com.peacocktv.peacocktvapp", "category": "streaming"}, {"icon": "⛰️", "name": "Paramount+", "enabled": true, "bundleId": "com.paramountplus.app", "category": "streaming"}, {"icon": "🎪", "name": "Showtime", "enabled": true, "bundleId": "com.showtime.standalone", "category": "streaming"}, {"icon": "📺", "name": "Paramount+", "enabled": true, "bundleId": "com.cbs.CBSAllAccess", "category": "streaming"}, {"icon": "🌍", "name": "Discovery+", "enabled": true, "bundleId": "com.discovery.mobile.discoveryplus", "category": "streaming"}, {"icon": "📺", "name": "Joyn", "enabled": true, "bundleId": "de.prosiebensat1digital.seventv", "category": "streaming"}, {"icon": "🌌", "name": "Sky Q", "enabled": true, "bundleId": "com.sky.skyq", "category": "streaming"}, {"icon": "🇬🇧", "name": "BBC iPlayer", "enabled": true, "bundleId": "com.bbc.iplayer", "category": "streaming"}, {"icon": "📺", "name": "ITV Hub", "enabled": true, "bundleId": "uk.co.itv.itvhub", "category": "streaming"}, {"icon": "4️⃣", "name": "All 4", "enabled": true, "bundleId": "com.channel4.channel4", "category": "streaming"}, {"icon": "🇩🇪", "name": "ZDF Mediathek", "enabled": true, "bundleId": "com.zdf.ZDFmediathek", "category": "streaming"}, {"icon": "🇩🇪", "name": "ARD Mediathek", "enabled": true, "bundleId": "de.daserste.Mediathek", "category": "streaming"}, {"icon": "📺", "name": "RTL+", "enabled": true, "bundleId": "com.rtl.rtlplus", "category": "streaming"}, {"icon": "🇫🇷", "name": "myCANAL", "enabled": true, "bundleId": "com.canalplus.mycanal", "category": "streaming"}, {"icon": "🎬", "name": "Rakuten TV", "enabled": true, "bundleId": "com.rakuten.rakutentv", "category": "streaming"}], "command_type": "EnableKioskMode", "returnTimeout": 1800}	pending	0	0	3	2025-08-19 11:48:37.247206	\N	\N
\.


--
-- Data for Name: push_notification_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_notification_templates (id, property_id, name, notification_type, title, message, payload_template, is_active, created_at, updated_at) FROM stdin;
c53ec4a2-c04e-4962-8a50-93ae92c0f9a3	41059600-402d-434e-9b34-2b4821f6e3a4	Device Offline Alert	device_offline	Device Offline	Device {{device_name}} has been offline for {{minutes}} minutes	{"action": "check_device", "severity": "warning"}	t	2025-08-19 10:57:49.580018	2025-08-19 10:57:49.580018
4c011ee4-f18f-4b4e-a3ac-5035f4fd5192	41059600-402d-434e-9b34-2b4821f6e3a4	Kiosk Mode Changed	kiosk_mode_changed	Kiosk Mode Updated	Kiosk mode has been {{status}} on {{device_name}}	{"severity": "info", "kiosk_enabled": "{{enabled}}"}	t	2025-08-19 10:57:49.581354	2025-08-19 10:57:49.581354
1e6ee5ca-8664-4dcb-853d-5e6b404d0d64	41059600-402d-434e-9b34-2b4821f6e3a4	Configuration Applied	config_applied	Configuration Update	New configuration has been applied to {{device_name}}	{"profiles": [], "severity": "info"}	t	2025-08-19 10:57:49.58193	2025-08-19 10:57:49.58193
\.


--
-- Data for Name: shop_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shop_products (id, property_id, name, description, short_description, price, original_price, currency, image_url, additional_images, category, availability, stock_count, is_featured, is_locally_made, is_sustainable, craftsperson_name, craftsperson_bio, vendor_id, materials, dimensions, weight, care_instructions, tags, sku, barcode, meta_title, meta_description, slug, rating_average, rating_count, is_active, is_archived, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: streaming_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.streaming_services (id, property_id, service_name, service_type, app_url_scheme, logo_url, instructions, requires_login, is_active, display_order, created_at, updated_at) FROM stdin;
f6b73f53-04e3-4200-a756-d41bbe8bc22b	41059600-402d-434e-9b34-2b4821f6e3a4	Netflix	streaming	nflx://	https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2c401b05a07288746ddf3bd3943fbc76/BrandAssets_Logos_01-Wordmark.jpg	Launch Netflix and log in with your account. Please log out when you check out.	t	t	1	2025-08-19 06:52:53.313183+00	2025-08-19 06:52:53.313183+00
b58b96ef-a315-465a-a573-6e1a21cb24b7	41059600-402d-434e-9b34-2b4821f6e3a4	Disney+	streaming	disneyplus://	https://cnbl-cdn.bamgrid.com/assets/7ecc8bcb60ad77193058d63e321bd21cbac2fc67281dcc9e7db35b73ad0ed03b/original	Launch Disney+ and log in with your account. Please log out when you check out.	t	t	2	2025-08-19 06:52:53.313183+00	2025-08-19 06:52:53.313183+00
2db5b1b0-b2a2-4a31-9ef6-2e9b2200cb17	41059600-402d-434e-9b34-2b4821f6e3a4	HBO Max	streaming	hbomax://	https://logos-world.net/wp-content/uploads/2021/08/HBO-Max-Logo.png	Launch HBO Max and log in with your account. Please log out when you check out.	t	t	3	2025-08-19 06:52:53.313183+00	2025-08-19 06:52:53.313183+00
6f02cc70-61b9-4599-aa95-3008d7402116	41059600-402d-434e-9b34-2b4821f6e3a4	Hulu	streaming	hulu://	https://logos-world.net/wp-content/uploads/2020/05/Hulu-Logo.png	Launch Hulu and log in with your account. Please log out when you check out.	t	t	4	2025-08-19 06:52:53.313183+00	2025-08-19 06:52:53.313183+00
d4c712f6-404f-4672-b178-da934e590c9a	41059600-402d-434e-9b34-2b4821f6e3a4	Spotify	music	spotify://	https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png	Launch Spotify and log in with your account. Please log out when you check out.	t	t	5	2025-08-19 06:52:53.313183+00	2025-08-19 06:52:53.313183+00
8bc51b8f-bbbb-48d4-a9d2-ffbd1540c9e1	41059600-402d-434e-9b34-2b4821f6e3a4	Apple Music	music	music://	https://logos-world.net/wp-content/uploads/2020/08/Apple-Music-Logo.png	Launch Apple Music. Use your Apple ID to access your music library.	t	t	6	2025-08-19 06:52:53.313183+00	2025-08-19 06:52:53.313183+00
\.


--
-- Data for Name: tvos_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tvos_devices (id, identifier, property_id, device_name, device_type, model, os_version, app_version, serial_number, is_active, last_seen, created_at, updated_at) FROM stdin;
1	9B254B22-DE53-4B32-AB01-6E22D930B77D	41059600-402d-434e-9b34-2b4821f6e3a4	Apple TV Simulator	apple_tv	Apple TV 4K	18.5	1.0.0	\N	t	2025-08-23 06:31:46.353831	2025-08-23 06:31:46.353831	2025-08-23 06:31:46.353831
\.


--
-- Name: dining_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dining_options_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 68, true);


--
-- Name: tvos_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tvos_devices_id_seq', 1, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: background_images background_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.background_images
    ADD CONSTRAINT background_images_pkey PRIMARY KEY (id);


--
-- Name: configuration_profiles configuration_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_profiles
    ADD CONSTRAINT configuration_profiles_pkey PRIMARY KEY (id);


--
-- Name: configuration_profiles configuration_profiles_profile_uuid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_profiles
    ADD CONSTRAINT configuration_profiles_profile_uuid_key UNIQUE (profile_uuid);


--
-- Name: device_profile_assignments device_profile_assignments_device_id_profile_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_profile_assignments
    ADD CONSTRAINT device_profile_assignments_device_id_profile_id_key UNIQUE (device_id, profile_id);


--
-- Name: device_profile_assignments device_profile_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_profile_assignments
    ADD CONSTRAINT device_profile_assignments_pkey PRIMARY KEY (id);


--
-- Name: devices devices_identifier_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_identifier_key UNIQUE (identifier);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: dining_options dining_options_external_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_options
    ADD CONSTRAINT dining_options_external_id_key UNIQUE (external_id);


--
-- Name: dining_options dining_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_options
    ADD CONSTRAINT dining_options_pkey PRIMARY KEY (id);


--
-- Name: dining_places dining_places_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_places
    ADD CONSTRAINT dining_places_pkey PRIMARY KEY (id);


--
-- Name: events events_external_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_external_id_key UNIQUE (external_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: guest_sessions guest_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_sessions
    ADD CONSTRAINT guest_sessions_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: mdm_alerts mdm_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mdm_alerts
    ADD CONSTRAINT mdm_alerts_pkey PRIMARY KEY (id);


--
-- Name: mdm_commands mdm_commands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mdm_commands
    ADD CONSTRAINT mdm_commands_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_information property_information_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_information
    ADD CONSTRAINT property_information_pkey PRIMARY KEY (id);


--
-- Name: push_notification_log push_notification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_log
    ADD CONSTRAINT push_notification_log_pkey PRIMARY KEY (id);


--
-- Name: push_notification_queue push_notification_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_queue
    ADD CONSTRAINT push_notification_queue_pkey PRIMARY KEY (id);


--
-- Name: push_notification_templates push_notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_templates
    ADD CONSTRAINT push_notification_templates_pkey PRIMARY KEY (id);


--
-- Name: shop_products shop_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_pkey PRIMARY KEY (id);


--
-- Name: streaming_services streaming_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streaming_services
    ADD CONSTRAINT streaming_services_pkey PRIMARY KEY (id);


--
-- Name: tvos_devices tvos_devices_identifier_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tvos_devices
    ADD CONSTRAINT tvos_devices_identifier_key UNIQUE (identifier);


--
-- Name: tvos_devices tvos_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tvos_devices
    ADD CONSTRAINT tvos_devices_pkey PRIMARY KEY (id);


--
-- Name: idx_activities_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activities_display_order ON public.activities USING btree (property_id, display_order) WHERE (is_active = true);


--
-- Name: idx_activities_guest_types; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activities_guest_types ON public.activities USING gin (target_guest_types);


--
-- Name: idx_activities_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activities_is_active ON public.activities USING btree (is_active);


--
-- Name: idx_activities_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activities_property_id ON public.activities USING btree (property_id);


--
-- Name: idx_config_profiles_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_config_profiles_active ON public.configuration_profiles USING btree (is_active);


--
-- Name: idx_config_profiles_property; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_config_profiles_property ON public.configuration_profiles USING btree (property_id);


--
-- Name: idx_config_profiles_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_config_profiles_type ON public.configuration_profiles USING btree (profile_type);


--
-- Name: idx_device_profiles_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_profiles_device ON public.device_profile_assignments USING btree (device_id);


--
-- Name: idx_device_profiles_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_profiles_profile ON public.device_profile_assignments USING btree (profile_id);


--
-- Name: idx_device_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_profiles_status ON public.device_profile_assignments USING btree (status);


--
-- Name: idx_devices_device_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_device_status ON public.devices USING btree (device_status);


--
-- Name: idx_devices_enrollment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_enrollment_status ON public.devices USING btree (enrollment_status);


--
-- Name: idx_devices_is_online; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_is_online ON public.devices USING btree (is_online);


--
-- Name: idx_devices_kiosk_mode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_kiosk_mode ON public.devices USING btree (kiosk_mode_enabled);


--
-- Name: idx_devices_last_seen; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_last_seen ON public.devices USING btree (last_seen);


--
-- Name: idx_devices_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_property_id ON public.devices USING btree (property_id);


--
-- Name: idx_devices_provisional_end; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_provisional_end ON public.devices USING btree (provisional_period_end) WHERE (provisional_period_end IS NOT NULL);


--
-- Name: idx_devices_room_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_room_number ON public.devices USING btree (property_id, room_number);


--
-- Name: idx_devices_supervised; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devices_supervised ON public.devices USING btree (supervised);


--
-- Name: idx_dining_places_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dining_places_active ON public.dining_places USING btree (is_active);


--
-- Name: idx_dining_places_cuisine; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dining_places_cuisine ON public.dining_places USING btree (cuisine_type);


--
-- Name: idx_dining_places_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dining_places_featured ON public.dining_places USING btree (is_featured);


--
-- Name: idx_dining_places_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dining_places_location ON public.dining_places USING btree (location_area);


--
-- Name: idx_dining_places_relevance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dining_places_relevance ON public.dining_places USING btree (relevance_status);


--
-- Name: idx_guest_sessions_auto_logout; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_sessions_auto_logout ON public.guest_sessions USING btree (auto_logout_scheduled) WHERE (is_active = true);


--
-- Name: idx_guest_sessions_guest_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_sessions_guest_id ON public.guest_sessions USING btree (guest_id);


--
-- Name: idx_guest_sessions_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_sessions_is_active ON public.guest_sessions USING btree (is_active);


--
-- Name: idx_guests_check_in_out; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_check_in_out ON public.guests USING btree (check_in_date, check_out_date);


--
-- Name: idx_guests_current_stay; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_current_stay ON public.guests USING btree (property_id, check_in_date, check_out_date) WHERE (is_active = true);


--
-- Name: idx_guests_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_is_active ON public.guests USING btree (is_active);


--
-- Name: idx_guests_profile_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_profile_type ON public.guests USING btree (profile_type);


--
-- Name: idx_guests_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_property_id ON public.guests USING btree (property_id);


--
-- Name: idx_mdm_alerts_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_alerts_created ON public.mdm_alerts USING btree (created_at);


--
-- Name: idx_mdm_alerts_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_alerts_device ON public.mdm_alerts USING btree (device_id);


--
-- Name: idx_mdm_alerts_property; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_alerts_property ON public.mdm_alerts USING btree (property_id);


--
-- Name: idx_mdm_alerts_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_alerts_resolved ON public.mdm_alerts USING btree (is_resolved);


--
-- Name: idx_mdm_alerts_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_alerts_severity ON public.mdm_alerts USING btree (severity);


--
-- Name: idx_mdm_alerts_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_alerts_type ON public.mdm_alerts USING btree (alert_type);


--
-- Name: idx_mdm_commands_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_commands_created ON public.mdm_commands USING btree (created_at);


--
-- Name: idx_mdm_commands_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_commands_device ON public.mdm_commands USING btree (device_id);


--
-- Name: idx_mdm_commands_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_commands_priority ON public.mdm_commands USING btree (priority DESC, created_at);


--
-- Name: idx_mdm_commands_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mdm_commands_status ON public.mdm_commands USING btree (status);


--
-- Name: idx_properties_guest_profile_config; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_properties_guest_profile_config ON public.properties USING gin (guest_profile_config);


--
-- Name: idx_property_information_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_information_active ON public.property_information USING btree (is_active);


--
-- Name: idx_property_information_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_information_category ON public.property_information USING btree (category);


--
-- Name: idx_property_information_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_information_order ON public.property_information USING btree (display_order);


--
-- Name: idx_property_information_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_information_property_id ON public.property_information USING btree (property_id);


--
-- Name: idx_property_information_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_information_type ON public.property_information USING btree (type);


--
-- Name: idx_property_information_unique_type; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_property_information_unique_type ON public.property_information USING btree (property_id, type) WHERE ((type)::text = ANY ((ARRAY['wifi'::character varying, 'check_in'::character varying, 'check_out'::character varying, 'parking'::character varying, 'emergency'::character varying])::text[]));


--
-- Name: idx_push_log_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_log_created ON public.push_notification_log USING btree (created_at);


--
-- Name: idx_push_log_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_log_device ON public.push_notification_log USING btree (device_id);


--
-- Name: idx_push_log_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_log_status ON public.push_notification_log USING btree (status);


--
-- Name: idx_push_log_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_log_type ON public.push_notification_log USING btree (notification_type);


--
-- Name: idx_push_queue_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_queue_created ON public.push_notification_queue USING btree (created_at);


--
-- Name: idx_push_queue_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_queue_device ON public.push_notification_queue USING btree (device_id);


--
-- Name: idx_push_queue_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_queue_priority ON public.push_notification_queue USING btree (priority DESC, created_at);


--
-- Name: idx_push_queue_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_queue_status ON public.push_notification_queue USING btree (status);


--
-- Name: idx_push_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_templates_active ON public.push_notification_templates USING btree (is_active);


--
-- Name: idx_push_templates_property; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_templates_property ON public.push_notification_templates USING btree (property_id);


--
-- Name: idx_push_templates_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_push_templates_type ON public.push_notification_templates USING btree (notification_type);


--
-- Name: idx_streaming_services_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_streaming_services_display_order ON public.streaming_services USING btree (property_id, display_order) WHERE (is_active = true);


--
-- Name: idx_streaming_services_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_streaming_services_is_active ON public.streaming_services USING btree (is_active);


--
-- Name: idx_streaming_services_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_streaming_services_property_id ON public.streaming_services USING btree (property_id);


--
-- Name: activities update_activities_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: devices update_devices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: guest_sessions update_guest_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_guest_sessions_updated_at BEFORE UPDATE ON public.guest_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: guests update_guests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: properties update_properties_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: streaming_services update_streaming_services_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_streaming_services_updated_at BEFORE UPDATE ON public.streaming_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activities activities_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: background_images background_images_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.background_images
    ADD CONSTRAINT background_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: configuration_profiles configuration_profiles_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_profiles
    ADD CONSTRAINT configuration_profiles_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: device_profile_assignments device_profile_assignments_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_profile_assignments
    ADD CONSTRAINT device_profile_assignments_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: device_profile_assignments device_profile_assignments_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_profile_assignments
    ADD CONSTRAINT device_profile_assignments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.configuration_profiles(id) ON DELETE CASCADE;


--
-- Name: devices devices_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: guest_sessions guest_sessions_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_sessions
    ADD CONSTRAINT guest_sessions_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: guest_sessions guest_sessions_streaming_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_sessions
    ADD CONSTRAINT guest_sessions_streaming_service_id_fkey FOREIGN KEY (streaming_service_id) REFERENCES public.streaming_services(id) ON DELETE CASCADE;


--
-- Name: guests guests_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: mdm_alerts mdm_alerts_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mdm_alerts
    ADD CONSTRAINT mdm_alerts_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: mdm_alerts mdm_alerts_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mdm_alerts
    ADD CONSTRAINT mdm_alerts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: mdm_commands mdm_commands_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mdm_commands
    ADD CONSTRAINT mdm_commands_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: mdm_commands mdm_commands_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mdm_commands
    ADD CONSTRAINT mdm_commands_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: property_information property_information_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_information
    ADD CONSTRAINT property_information_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: push_notification_log push_notification_log_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_log
    ADD CONSTRAINT push_notification_log_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE SET NULL;


--
-- Name: push_notification_queue push_notification_queue_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_queue
    ADD CONSTRAINT push_notification_queue_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: push_notification_templates push_notification_templates_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_templates
    ADD CONSTRAINT push_notification_templates_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: shop_products shop_products_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: streaming_services streaming_services_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streaming_services
    ADD CONSTRAINT streaming_services_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: tvos_devices tvos_devices_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tvos_devices
    ADD CONSTRAINT tvos_devices_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- PostgreSQL database dump complete
--

