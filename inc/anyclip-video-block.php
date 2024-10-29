<?php

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

function Anyclip_Load_Video_block()
{
    wp_enqueue_script(
        'anyclip-video-block',
        plugin_dir_url(__FILE__) . '../js/anyclip-video.js',
        array('wp-blocks', 'wp-editor'),
        true
    );
    wp_localize_script(
        'anyclip-video-block', 'constants', array(
        'ANYCLIP_STUDIO_URL' => ANYCLIP_STUDIO_URL,
        'ANYCLIP_ASSETS_URL' => ANYCLIP_ASSETS_URL,
        'ANYCLIP_API_URL' => ANYCLIP_API_URL,
        'ANYCLIP_USER_EMAIL' => ANYCLIP_USER_EMAIL
        )
    );
    wp_enqueue_style(
        'anyclip-video-block',
        plugin_dir_url(__FILE__) . '../css/anyclip-media.css',
        false
    );
}

add_action('enqueue_block_editor_assets', 'Anyclip_Load_Video_block');
