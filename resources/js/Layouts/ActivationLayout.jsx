import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useSidebarState } from '../hooks/useSidebarState';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import Backdrop from '@/Components/Backdrop';
import { ThemeProvider, ThemeWrapper } from '@/context/ThemeContext';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import PageBreadcrumb from '@/Components/PageBreadcrumb';


export default function ActivationLayout({ prevPage = null, pageTitle, children }) {
    const user = usePage().props.auth.user;

    return (
        <ThemeProvider>
            <ThemeWrapper>
            <SidebarProvider>
                <LayoutContent pageTitle={pageTitle} children={children} prevPage={prevPage} />
            </SidebarProvider>
            </ThemeWrapper>
        </ThemeProvider>
    );
}

function LayoutContent({ prevPage, pageTitle, children }) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <div className="min-h-screen xl:flex">
            <div>
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
                } ${isMobileOpen ? "ml-0" : ""}`}
            >
                <AppHeader />
                <div className="p-4 mx-auto md:p-6">
                    <PageBreadcrumb pageTitle={pageTitle} prevPage={prevPage}/>
                    {children}
                </div>
            </div>
        </div>
    );
}