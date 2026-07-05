-- ========================================================
-- CRIAÇÃO AUTOMÁTICA DE PERFIS (TRIGGER + RETROATIVO)
-- ========================================================

-- 1. Criar a função que lida com novos usuários cadastrados no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role VARCHAR(50);
    clinic_id_val UUID;
    full_name_val VARCHAR(255);
BEGIN
    -- Determinar o papel (role) baseado no email ou metadata
    IF NEW.email = 'admin@saas.com' THEN
        default_role := 'SUPER_ADMIN';
    ELSE
        default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'CLINIC_ADMIN');
    END IF;

    -- Extrair clinic_id
    IF NEW.raw_user_meta_data->>'clinic_id' IS NOT NULL AND NEW.raw_user_meta_data->>'clinic_id' <> '' THEN
        clinic_id_val := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
    ELSE
        clinic_id_val := NULL;
    END IF;

    -- Extrair nome completo ou usar a primeira parte do email
    full_name_val := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        INITCAP(split_part(NEW.email, '@', 1))
    );

    -- Inserir na tabela public.profiles
    INSERT INTO public.profiles (id, clinic_id, role, full_name)
    VALUES (
        NEW.id,
        clinic_id_val,
        default_role,
        full_name_val
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger para executar a função após qualquer inserção em auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Carga Retroativa: Criar perfis para usuários existentes no auth.users que ainda não possuem perfil
INSERT INTO public.profiles (id, clinic_id, role, full_name)
SELECT 
    u.id,
    CASE 
        WHEN u.raw_user_meta_data->>'clinic_id' IS NOT NULL AND u.raw_user_meta_data->>'clinic_id' <> '' 
        THEN (u.raw_user_meta_data->>'clinic_id')::UUID 
        ELSE NULL 
    END,
    CASE 
        WHEN u.email = 'admin@saas.com' THEN 'SUPER_ADMIN'
        ELSE COALESCE(u.raw_user_meta_data->>'role', 'CLINIC_ADMIN')
    END,
    COALESCE(u.raw_user_meta_data->>'full_name', INITCAP(split_part(u.email, '@', 1)))
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
