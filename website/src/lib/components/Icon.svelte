<script lang="ts">
  import manifest from '../../assets/icons/manifest.json';
  import { resolveIcon } from './resolve-icon.model.ts';

  const {
    name = 'link',
    optical = false,
  }: {
    name?: string;
    optical?: boolean;
  } = $props();

  function getIconData(): {
    icon: ReturnType<typeof resolveIcon>;
    metadata: (typeof manifest.icons)[keyof typeof manifest.icons];
    style: string;
  } {
    const icon = resolveIcon(name);

    const metadata = manifest.icons[icon];

    const columnCount = String(manifest.count);

    const position = String(metadata.position);

    const opticalScale = String(metadata.opticalScale);

    const style = `--icon-columns: ${columnCount}; --icon-position: ${position}%; --icon-optical-scale: ${opticalScale}`;

    return {
      icon,
      metadata,
      style,
    };
  }

  const iconData = $derived.by(getIconData);
</script>

<span
  class:site-icon-monochrome={!iconData.metadata.colored}
  class:site-icon-optical={optical}
  class="site-icon"
  data-platform={iconData.icon}
  data-finish="beveled"
  style={iconData.style}
  aria-hidden="true"
>
  <span class="site-icon-face"></span>
</span>
