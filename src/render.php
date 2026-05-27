<?php
/**
 * Render callback for the Flame Text Banner block.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 */

$text             = $attributes['text'] ?? 'FLAME TEXT';
$text_size        = $attributes['textSize'] ?? 'large';
$flame_inner      = $attributes['flameColorInner'] ?? '#ffdd33';
$flame_outer      = $attributes['flameColorOuter'] ?? '#ff4500';
$background_color = $attributes['backgroundColor'] ?? '#1a1a2e';

$size_map = array(
	'small'  => '2rem',
	'medium' => '3.5rem',
	'large'  => '5rem',
	'xlarge' => '7rem',
);

$font_size = isset( $size_map[ $text_size ] ) ? $size_map[ $text_size ] : '5rem';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'style'                  => 'background-color:' . esc_attr( $background_color ) . ';',
		'data-flame-color-inner' => esc_attr( $flame_inner ),
		'data-flame-color-outer' => esc_attr( $flame_outer ),
	)
);
?>
<div <?php echo $wrapper_attributes; ?>>
	<div class="telex-flame-text-banner__inner">
		<canvas class="telex-flame-text-banner__canvas"></canvas>
		<span class="telex-flame-text-banner__text" style="font-size:<?php echo esc_attr( $font_size ); ?>">
			<?php echo esc_html( $text ); ?>
		</span>
	</div>
</div>
