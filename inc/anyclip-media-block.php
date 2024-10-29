<?php

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

function Allow_Authors_To_Post_html()
{
    return get_role('author') -> add_cap('unfiltered_html');
}

function Allow_Contributor_To_Post_html()
{
    return get_role('contributor') -> add_cap('unfiltered_html');
}

function Anyclip_Load_Anyclip_block()
{
    wp_enqueue_script(
        'anyclip-media-block',
        plugin_dir_url(__FILE__) . '../js/anyclip-media.js',
        array('wp-blocks', 'wp-editor'),
        true
    );
    wp_localize_script(
        'anyclip-media-block', 'constants', array(
        'ANYCLIP_STUDIO_URL' => ANYCLIP_STUDIO_URL,
        'ANYCLIP_ASSETS_URL' => ANYCLIP_ASSETS_URL,
        'ANYCLIP_API_URL' => ANYCLIP_API_URL,
        'ANYCLIP_USER_EMAIL' => ANYCLIP_USER_EMAIL
        )
    );
    wp_enqueue_style(
        'anyclip-media-block',
        plugin_dir_url(__FILE__) . '../css/anyclip-media.css',
        false
    );
}

add_filter('admin_init', 'Allow_Authors_To_Post_html');
add_filter('admin_init', 'Allow_Contributor_To_Post_html');
add_action('enqueue_block_editor_assets', 'Anyclip_Load_Anyclip_block');
