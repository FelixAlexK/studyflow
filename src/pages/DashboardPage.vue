<script setup lang="ts">
    import { useConvexQuery } from "convex-vue";
import { api } from "../../convex/_generated/api";

const {username} = defineProps<{username: string}>();

const { data: tasks } = useConvexQuery(api.tasks.getTaskList);

</script>

<template>

    <!-- Main Content -->
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Welcome, {{ username }}</h2>
        <p class="text-muted-foreground">
          Manage your tasks and study sessions here.
        </p>
      </div>

      <div class="rounded-lg border p-6">
        <h3 class="mb-4 text-xl font-semibold">Your Tasks</h3>
        <div v-if="tasks && tasks.length > 0" class="space-y-2">
          <div
            v-for="task in tasks"
            :key="task._id"
            class="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
          >
            <div class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary"></div>
            <span>{{ task.text }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">No tasks yet. Start by creating your first task!</p>
      </div>
    </div>

</template>