<script lang="ts">
  import manifest from '../../assets/icons/manifest.json';

  export type IconName = keyof typeof manifest.icons;

  const {
    name = 'link',
    optical = false,
  }: {
    name?: string;
    optical?: boolean;
  } = $props();

  function isIconName(value: string): value is IconName {
    return Object.hasOwn(manifest.icons, value);
  }

  function resolveIcon(value: string): IconName {
    if (isIconName(value)) {
      return value;
    }

    return 'link';
  }

  const icon = $derived(resolveIcon(name));

  const metadata = $derived(manifest.icons[icon]);

  const style = $derived(
    `--icon-columns: ${String(manifest.count)}; --icon-position: ${String(metadata.position)}%; --icon-optical-scale: ${String(metadata.opticalScale)}`,
  );
</script>

<span
  class:site-icon-monochrome={!metadata.colored}
  class:site-icon-optical={optical}
  class="site-icon"
  data-platform={icon}
  data-finish="beveled"
  {style}
  aria-hidden="true"
>
  <span class="site-icon-face"></span>
</span>
