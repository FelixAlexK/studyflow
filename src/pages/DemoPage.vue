<script setup lang="ts" >

</script>

<template>
  
    

    <!-- Main content -->
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Welcome to StudyFlow</h2>
        <p class="text-muted-foreground">
          Track your learning progress and manage your study sessions efficiently.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg border bg-card p-6 shadow-sm">
          <h3 class="text-lg font-semibold">Study Sessions</h3>
          <p class="mt-2 text-3xl font-bold">12</p>
          <p class="text-sm text-muted-foreground">This week</p>
        </div>

        <div class="rounded-lg border bg-card p-6 shadow-sm">
          <h3 class="text-lg font-semibold">Tasks Completed</h3>
          <p class="mt-2 text-3xl font-bold">28</p>
          <p class="text-sm text-muted-foreground">This month</p>
        </div>

        <div class="rounded-lg border bg-card p-6 shadow-sm">
          <h3 class="text-lg font-semibold">Study Streak</h3>
          <p class="mt-2 text-3xl font-bold">5 days</p>
          <p class="text-sm text-muted-foreground">Keep it up!</p>
        </div>
      </div>

      <div class="rounded-lg border p-6">
        <h3 class="mb-4 text-xl font-semibold">Recent Activity</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <p class="font-medium">Mathematics Study Session</p>
              <p class="text-sm text-muted-foreground">Completed 2 hours ago</p>
            </div>
            <span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              Completed
            </span>
          </div>
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <p class="font-medium">Physics Assignment</p>
              <p class="text-sm text-muted-foreground">Due tomorrow</p>
            </div>
            <span class="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
              In Progress
            </span>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Chemistry Notes Review</p>
              <p class="text-sm text-muted-foreground">Scheduled for later</p>
            </div>
            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              Planned
            </span>
          </div>
        </div>
      </div>
    </div>

    
</template>
