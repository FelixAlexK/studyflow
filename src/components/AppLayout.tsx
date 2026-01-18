'use client';

import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { Book, Calendar, CheckSquare, Home, Settings, Timer } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";


interface AppLayoutProps {
	children: ReactNode;
	headerTitle?: string;
	headerActions?: ReactNode;
	rightPanel?: ReactNode;
	showRightPanelDefault?: boolean;
}




interface NavigationItem {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	href: string;
}

export default function AppLayout({
	children,
	headerTitle = "Dashboard",
	headerActions,
	rightPanel,
	showRightPanelDefault = false,
}: AppLayoutProps) {
	const [showRightPanel, setShowRightPanel] = useState(showRightPanelDefault);
	const routerState = useRouterState();
	 const { signOut, user } = useAuth();
	const handleSignOut = async () => {
		try {
			signOut({ returnTo: '/' });
		} catch (err) {
			console.error("Sign up exception:", err);
		}
	};


	// Use the better-auth hook to get the authenticated user
	const navigationItems: NavigationItem[] = [
		{
			title: "Dashboard",
			icon: Home,
			href: `/`,
		},
		{
			title: "Study Sessions",
			icon: Book,
			href: "/study",
		},
		{
			title: "Tasks",
			icon: CheckSquare,
			href: "/tasks",
		},
		{
			title: "Calendar",
			icon: Calendar,
			href: "/calendar",
		},
		{
			title: "Focus Timer",
			icon: Timer,
			href: "/pomodoro",
		},
	];

	const secondaryItems: NavigationItem[] = [
		{
			title: "Settings",
			icon: Settings,
			href: "/settings",
		},
	];

	const isActive = (href: string): boolean => {
		return routerState.location.pathname === href;
	};

	return (
		<SidebarProvider>
			{/* Left Sidebar */}
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild>
								<Link to="/">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
										<Book className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">StudyFlow</span>
										<span className="truncate text-xs">
											Your learning companion
										</span>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent>
					{/* Main Navigation */}
					<SidebarGroup>
						<SidebarGroupLabel>Navigation</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{navigationItems.map((item) => {
									const Icon = item.icon;
									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild isActive={isActive(item.href)}>
												<Link to={item.href}>
													<Icon className="size-4" />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					{/* Secondary Navigation */}
					<SidebarGroup className="mt-auto">
						<SidebarGroupContent>
							<SidebarMenu>
								{secondaryItems.map((item) => {
									const Icon = item.icon;
									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild isActive={isActive(item.href)}>
												<Link to={item.href}>
													<Icon className="size-4" />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
									<span className="text-sm font-semibold">
										{user?.firstName?.[0]}
									</span>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user?.firstName}</span>
									<span className="truncate text-xs">{user?.email}</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>

				<SidebarRail />
			</Sidebar>

			{/* Main Content Area */}
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<div className="flex flex-1 items-center justify-between">
						<h1 className="text-lg font-semibold">{headerTitle}</h1>
						<div className="flex items-center gap-2">
							{headerActions}
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowRightPanel(!showRightPanel)}
							>
								{showRightPanel ? "Hide Panel" : "Show Panel"}
							</Button>
							<Button variant="outline" size="sm" onClick={handleSignOut}>
								SignOut
							</Button>
						</div>
					</div>
				</header>

				<div className="flex flex-1 overflow-hidden">
					{/* Main Content */}
					<div className="flex-1 overflow-auto p-4">{children}</div>

					{/* Optional Right Panel */}
					{showRightPanel && (
						<div className="border-l bg-muted/10 overflow-auto transition-all duration-300">
							<div className="w-80 p-4">
								{rightPanel ? (
									rightPanel
								) : (
									<>
										<h2 className="mb-4 text-sm font-semibold">Right Panel</h2>
										<div className="space-y-4">
											<div className="rounded-lg border p-3">
												<h3 className="text-sm font-medium">Quick Info</h3>
												<p className="mt-1 text-xs text-muted-foreground">
													Additional information and actions appear here.
												</p>
											</div>
											<div className="rounded-lg border p-3">
												<h3 className="text-sm font-medium">Recent Activity</h3>
												<p className="mt-1 text-xs text-muted-foreground">
													Track your recent study sessions and tasks.
												</p>
											</div>
											<div className="rounded-lg border p-3">
												<h3 className="text-sm font-medium">Notifications</h3>
												<p className="mt-1 text-xs text-muted-foreground">
													Stay updated with your progress.
												</p>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
