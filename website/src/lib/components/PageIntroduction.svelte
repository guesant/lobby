<script lang="ts">
  const {
    title,
    description,
    titleID,
  }: {
    title: string;
    description: string;
    titleID: string;
  } = $props();
</script>

<section class="presentation-group page-introduction">
  <header class="section-toolbar">
    <h1 class="section-toolbar-title" id={titleID}>{title}</h1>
  </header>
  <div class="presentation page-introduction-content" data-rail-anchor>
    <p class="presentation-intro">{description}</p>
  </div>
</section>
