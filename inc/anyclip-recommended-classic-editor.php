<?php

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

function Anyclip_Add_Recommended_button()
{
        add_thickbox();
        $template = <<<acm
    <div id="anyclip-recommended-content" style="display:none;">
    </div>
    <a id="recommendedButton" class="thickbox button">
        <span class="dashicons dashicons-editor-video" style="vertical-align: text-top"></span>
        AnyClip Recommended
    </a>
acm;

        printf(
            $template, sprintf( // @codingStandardsIgnoreLine
                ANYCLIP_STUDIO_URL . '?mode=wp' // @codingStandardsIgnoreLine
            )
        );
}

add_action('media_buttons', 'Anyclip_Add_Recommended_button');