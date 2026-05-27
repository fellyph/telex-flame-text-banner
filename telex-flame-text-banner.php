<?php
/**
 * Plugin Name:       Krakow Text Banner Block
 * Description:       A striking banner block that renders text with animated flame effects rising from the letters.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            WordPress Telex
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       telex-flame-text-banner
 *
 * @package TelexFlameTextBanner
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
if ( ! function_exists( 'telex_flame_text_banner_telex_flame_text_banner_block_init' ) ) {
	function telex_flame_text_banner_telex_flame_text_banner_block_init(): void {
		register_block_type( __DIR__ . '/build/' );
	}
}
add_action( 'init', 'telex_flame_text_banner_telex_flame_text_banner_block_init' );