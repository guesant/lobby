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

  const getIcon = (): ReturnType<typeof resolveIcon> => {
    return resolveIcon(name);
  };

  const icon = $derived.by(getIcon);

  const metadata = $derived(manifest.icons[icon]);

  const columnCount = String(manifest.count);

  const position = String(metadata.position);

  const opticalScale = String(metadata.opticalScale);

  const style = $derived(
    `--icon-columns: ${columnCount}; --icon-position: ${position}%; --icon-optical-scale: ${opticalScale}`,
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
