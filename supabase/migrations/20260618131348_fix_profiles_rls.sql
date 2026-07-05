-- ========================================================
-- CORREÇÃO DE RECURSÃO INFINITA NA TABELA PROFILES
-- ========================================================

-- 1. Remover a política recursiva antiga (que usava FOR ALL e causava loop no SELECT)
DROP POLICY IF EXISTS profiles_modify_clinic ON public.profiles;

-- 2. Criar política específica para INSERT
CREATE POLICY profiles_insert_policy ON public.profiles
    FOR INSERT WITH CHECK (
        public.is_super_admin() 
        OR auth.uid() = id
    );

-- 3. Criar política específica para UPDATE
CREATE POLICY profiles_update_policy ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id
        OR public.is_super_admin()
        OR (
            clinic_id = public.get_auth_clinic_id() 
            AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'CLINIC_ADMIN'
        )
    );

-- 4. Criar política específica para DELETE
CREATE POLICY profiles_delete_policy ON public.profiles
    FOR DELETE USING (
        public.is_super_admin()
        OR (
            clinic_id = public.get_auth_clinic_id() 
            AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'CLINIC_ADMIN'
        )
    );
