alter table "public"."platform_homeowners" add column "internal" boolean not null default false;

alter table "public"."platform_installers" add column "internal" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_internal_consistency()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    installer_internal BOOLEAN;
    homeowner_internal BOOLEAN;
BEGIN
    -- Get internal flag of the installer
    SELECT internal INTO installer_internal
    FROM platform_installers
    WHERE id = NEW.installer_id;

    -- Get internal flag of the homeowner associated with the job
    SELECT platform_homeowners.internal INTO homeowner_internal
    FROM platform_homeowners
    JOIN platform_jobs ON platform_homeowners.id = platform_jobs.homeowner_id
    WHERE platform_jobs.id = NEW.job_id;

    -- Check if internal flags match
    IF installer_internal IS DISTINCT FROM homeowner_internal THEN
        RAISE EXCEPTION 'Installer and homeowner internal flags do not match.';
    END IF;

    -- If all checks pass, allow the insert
    RETURN NEW;
END;
$function$
;

CREATE TRIGGER check_internal_consistency_before_insert BEFORE INSERT ON public.platform_quotes FOR EACH ROW EXECUTE FUNCTION check_internal_consistency();


