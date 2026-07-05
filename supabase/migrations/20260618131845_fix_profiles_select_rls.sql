-- ========================================================
-- CORREÇÃO DE RLS (SELECT) NA TABELA PROFILES
-- ========================================================

-- 1. Remover a política de SELECT antiga (que exigia clinic_id no JWT antes do login carregar)
DROP POLICY IF EXISTS profiles_select_clinic ON public.profiles;

-- 2. Criar a nova política de SELECT permitindo que:
-- - Qualquer usuário autenticado leia seu próprio perfil (essencial no momento do login!)
-- - Usuários da mesma clínica vejam perfis de colegas (via clinic_id no JWT)
-- - Super Admins vejam tudo
CREATE POLICY profiles_select_clinic ON public.profiles
    FOR SELECT USING (
        auth.uid() = id
        OR clinic_id = public.get_auth_clinic_id()
        OR public.is_super_admin()
    );
