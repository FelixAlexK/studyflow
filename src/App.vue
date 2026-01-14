<script setup lang="ts">
import { Button } from "@/components/ui/button";
import AppLayout from "./components/layouts/AppLayout.vue";
import { signOut, useSession } from "./lib/auth-client";
import AuthComponent from "./pages/AuthPage.vue";

const session = useSession(); 

const handleSignOut = async () => {
	try {
		await signOut();
	} catch (error) {
		console.error("Sign out error:", error);
	}
};
</script>

<template>
  <AppLayout v-if="session.data && !$route.path.startsWith('/auth')" >
    <template #header-title>
      StudyFlow Dashboard
    </template>
    
    <template #header-actions>
      <Button variant="outline" size="sm" @click="handleSignOut">
        Sign Out
      </Button>
    </template>
    <RouterView></RouterView>

     
  </AppLayout>

  <!-- Login/Signup Screen -->
   <AuthComponent v-else></AuthComponent>
  
</template>