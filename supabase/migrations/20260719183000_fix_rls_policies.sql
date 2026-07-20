-- ========================================================
-- CORREÇÃO DE POLÍTICAS RLS E FUNÇÕES DE RESOLUÇÃO
-- ========================================================

-- 1. Criar ou redefinir a função get_auth_role()
-- Retorna o cargo (role) do usuário logado de forma direta e segura (bypassando RLS)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Redefinir a função get_auth_clinic_id()
-- Agora busca na tabela profiles de forma direta e persistente,
-- evitando depender exclusivamente de claims do JWT que podem estar desatualizadas ou ausentes.
CREATE OR REPLACE FUNCTION public.get_auth_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 3. Habilitar RLS de forma explícita na tabela clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas de clinics
DROP POLICY IF EXISTS clinics_read_public ON public.clinics;
DROP POLICY IF EXISTS clinics_all_super_admin ON public.clinics;
DROP POLICY IF EXISTS clinics_insert_public ON public.clinics;
DROP POLICY IF EXISTS clinics_update_owner ON public.clinics;

-- Recriar políticas para clinics
-- Leitura pública baseada em subdomínio (para Whitelabel no login)
CREATE POLICY clinics_read_public ON public.clinics
    FOR SELECT USING (true);

-- Inserção pública para cadastro de novas clínicas
CREATE POLICY clinics_insert_public ON public.clinics
    FOR INSERT WITH CHECK (true);

-- Modificações completas apenas por Super Admin
CREATE POLICY clinics_all_super_admin ON public.clinics
    FOR ALL USING (public.is_super_admin());

-- Membros com permissão de CLINIC_ADMIN podem atualizar apenas as configurações de sua própria clínica (logo, cores, etc.)
CREATE POLICY clinics_update_owner ON public.clinics
    FOR UPDATE USING (
        id = public.get_auth_clinic_id() 
        AND public.get_auth_role() = 'CLINIC_ADMIN'
    );


-- 4. Corrigir políticas da tabela profiles
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;

CREATE POLICY profiles_update_policy ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id
        OR public.is_super_admin()
        OR (
            clinic_id = public.get_auth_clinic_id() 
            AND public.get_auth_role() = 'CLINIC_ADMIN'
        )
    );

CREATE POLICY profiles_delete_policy ON public.profiles
    FOR DELETE USING (
        public.is_super_admin()
        OR (
            clinic_id = public.get_auth_clinic_id() 
            AND public.get_auth_role() = 'CLINIC_ADMIN'
        )
    );


-- 5. Corrigir políticas da tabela whatsapp_config
DROP POLICY IF EXISTS whatsapp_config_all_clinic ON public.whatsapp_config;

CREATE POLICY whatsapp_config_all_clinic ON public.whatsapp_config
    FOR ALL USING (
        (clinic_id = public.get_auth_clinic_id() AND public.get_auth_role() = 'CLINIC_ADMIN') 
        OR public.is_super_admin()
    );
