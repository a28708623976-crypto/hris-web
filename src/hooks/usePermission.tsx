import type {ReactNode} from 'react';
import type {Role} from '../types';
import {useStore} from '../store';
export const usePermission=(roles:Role[])=>roles.includes(useStore(s=>s.role));
export function ProtectedField({role,children}:{role:Role[];children:ReactNode}){return usePermission(role)?<>{children}</>:null}
export {canAccess} from '../utils/permissions';
