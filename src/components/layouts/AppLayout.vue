<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RouterLink } from 'vue-router'
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

import { useSession } from "@/lib/auth-client";
const session = useSession();

// Icons - you can replace these with your icon library
const HomeIcon =
	"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6";
const StudyIcon =
	"M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253";
const TasksIcon =
	"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4";
const CalendarIcon =
	"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z";
const SettingsIcon =
	"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z";

const showRightPanel = ref(false);

const navigationItems = [
	{ title: "Dashboard", icon: HomeIcon, url: `/dashboards/${session.value.data?.user.name}` },
	{ title: "Study Sessions", icon: StudyIcon, url: "/study" },
	{ title: "Tasks", icon: TasksIcon, url: `/demo` },
	{ title: "Calendar", icon: CalendarIcon, url: "/calendar" },
];

const secondaryItems = [
	{ title: "Settings", icon: SettingsIcon, url: "/settings" },
];
</script>

<template>
  <SidebarProvider>
    <!-- Left Sidebar -->
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <RouterLink to="/">
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="StudyIcon" />
                  </svg>
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">StudyFlow</span>
                  <span class="truncate text-xs">Your learning companion</span>
                </div>
              </RouterLink >
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <!-- Main Navigation -->
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navigationItems" :key="item.title">
                <SidebarMenuButton as-child>
                  <RouterLink :to="item.url">
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                    <span>{{ item.title }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <!-- Secondary Navigation -->
        <SidebarGroup class="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in secondaryItems" :key="item.title">
                <SidebarMenuButton as-child>
                  <RouterLink :to="item.url">
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                    <span>{{ item.title }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                <img :src="session.data?.user.image" alt="User Avatar" class="size-6 rounded-full object-cover" v-if="session.data?.user.image" />
                <span v-else class="text-sm font-semibold">{{ session.data?.user.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ session.data?.user.name }}</span>
                <span class="truncate text-xs">{{ session.data?.user.email }}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>

    <!-- Main Content Area -->
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <div class="flex flex-1 items-center justify-between">
          <h1 class="text-lg font-semibold">
            <slot name="header-title">Dashboard</slot>
          </h1>
          <div class="flex items-center gap-2">
            <slot name="header-actions" />
            <Button
              variant="outline"
              size="sm"
              @click="showRightPanel = !showRightPanel"
            >
              {{ showRightPanel ? 'Hide Panel' : 'Show Panel' }}
            </Button>
          </div>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <!-- Main Content -->
        <div class="flex-1 overflow-auto p-4">
          <slot />
        </div>

        <!-- Optional Right Panel -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="w-0 opacity-0"
          enter-to-class="w-80 opacity-100"
          leave-from-class="w-80 opacity-100"
          leave-to-class="w-0 opacity-0"
        >
          <aside
            v-if="showRightPanel"
            class="border-l bg-muted/10"
          >
            <ScrollArea class="h-full">
              <div class="p-4">
                <h2 class="mb-4 text-sm font-semibold">Right Panel</h2>
                <slot name="right-panel">
                  <div class="space-y-4">
                    <div class="rounded-lg border p-3">
                      <h3 class="text-sm font-medium">Quick Info</h3>
                      <p class="mt-1 text-xs text-muted-foreground">
                        Additional information and actions appear here.
                      </p>
                    </div>
                    <div class="rounded-lg border p-3">
                      <h3 class="text-sm font-medium">Recent Activity</h3>
                      <p class="mt-1 text-xs text-muted-foreground">
                        Track your recent study sessions and tasks.
                      </p>
                    </div>
                    <div class="rounded-lg border p-3">
                      <h3 class="text-sm font-medium">Notifications</h3>
                      <p class="mt-1 text-xs text-muted-foreground">
                        Stay updated with your progress.
                      </p>
                    </div>
                  </div>
                </slot>
              </div>
            </ScrollArea>
          </aside>
        </Transition>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

