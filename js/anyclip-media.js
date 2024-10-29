const { __ } = wp.i18n; // Import __() from wp.i18n

const parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const emptyButtonStyles = {
    'background-color': '#0083b8',
    'color': 'white',
};

const selectedButtonStyles = {
    'background-color': 'white',
    'opacity': 1,
    'color': 'rgb(85, 85, 85)',
};

function changeButtonsColor() {
    const emptyPlaylist = jQuery("button:contains('AnyClip Playlist')");
    const emptyVideo = jQuery("button:contains('AnyClip Video')");
    const recommended = jQuery("button:contains('AnyClip Recommended')");
    const filled = jQuery("button:contains('Edit')");

    jQuery(emptyPlaylist).css(emptyButtonStyles);
    jQuery(emptyVideo).css(emptyButtonStyles);
    jQuery(recommended).css(emptyButtonStyles);
    jQuery(filled).css(selectedButtonStyles);
}

jQuery(document).ready(function ($) {
    const playlistButton = $("button:contains('AnyClip Playlist')");
    const videoButton = $("button:contains('AnyClip Video')");
    $(playlistButton).css(emptyButtonStyles);
    $(videoButton).css(emptyButtonStyles);
});

wp.blocks.registerBlockType('anyclip/media-box', {
    title: 'AnyClip Playlist',
    description: 'Block inserts anyclip player',
    icon: 'playlist-video',
    category: 'common',
    supports: {
        multiple: true,
        html: true,
        reusable: false,
    },
    attributes: {
        multiple: false,
        html: true,
        contentHTML: {
            type: 'string',
            source: 'html',
            selector: 'div',
        },
        thumbnail: {
            type: 'string',
            meta: 'thumbnail'
        },
        playlistId: {
            type: 'number',
            meta: 'playlistId'
        },
        handler:{
            type: 'function'
        }
    },

    edit: function (props) {
        const { attributes: { contentHTML, thumbnail, playlistId, handler }, setAttributes } = props;
        const postTitle = wp.data.select('core/editor').getCurrentPostAttribute('title');
        let msgEventListener;
        if( ! handler ){
            msgEventListener = ( function( msg ) {
                if (msg && msg.data && msg.data.embed) {
                    doInsert({
                        embedCode: msg.data.embed,
                        thumbnail: msg.data.thumbnail || '',
                        playlistId: msg.data.playlistId
                    })
                }
                if (msg && msg.data.type === 'ac_editor_login') {
                    localStorage.setItem('pcn/creds', msg.data.token);
                }
            });
            setAttributes({
                handler: msgEventListener
            });
        }else{
            msgEventListener = handler;
        }

        function updateContent(data) {
            setAttributes({
                contentHTML: data.embedCode,
                thumbnail: data.thumbnail,
                playlistId: data.playlistId
            });

        }

        function closeModal() {
            setAttributes({
                isModalOpen: false,
            });
            window.removeEventListener("message", msgEventListener, false);
        }

        function openModal() {
            setAttributes({
                isModalOpen: true,
            });
            window.addEventListener("message", msgEventListener, false);
        }

        function doInsert(data) {
            setAttributes({
                isModalOpen: false,
            });

            window.removeEventListener("message", msgEventListener, false);

            updateContent(data);
        }

        if (postTitle === 'Auto Draft' || postTitle === '') return wp.element.createElement(
            "div",
            null,
            wp.element.createElement("div", {
                className: "components-placeholder"
            },
            __('Save post with title first', "anyclip-media")
            )
        );

        setTimeout(() => changeButtonsColor(), 0);

        let modalView = null;

        if (props.attributes.isModalOpen) {

            modalView = wp.element.createElement(wp.components.Modal, {
                    shouldCloseOnEsc: true,
                    isDefault: true,
                    isFullScreen: true,
                    shouldCloseOnClickOutside: false,
                    onRequestClose: closeModal,
                    title: wp.element.createElement(
                        'div',
                        { className: 'video-playlist-title-wrapper' },
                        wp.element.createElement('img', {
                            src: `${window.constants.ANYCLIP_ASSETS_URL}/anyclip-logo-transparent.png`,
                            width: '77px',
                        }),
                        wp.element.createElement('span', { className: 'title' }, 'Insert AnyClip Playlist')
                    ),
                },
                wp.element.createElement("iframe", {
                    src: `${constants.ANYCLIP_STUDIO_URL}?${playlistId ? `playlist=${playlistId}` : ''}&mode=wp&title=${postTitle}&login=wp&u=${constants.ANYCLIP_USER_EMAIL}`,
                    className: 'anyclip-media-iframe'
                }),
            )
        }
        
        return wp.element.createElement(
            wp.element.Fragment,
            null,
            wp.element.createElement(
                'div',
                {
                    className: "components-placeholder",
                },

                thumbnail && thumbnail.length
                ?
                wp.element.createElement('img', {
                    src: thumbnail,
                })
                :
                wp.element.createElement(wp.components.Icon, {
                    icon: 'format-video',
                    size: 320,
                },
                    ''
                ),
                wp.element.createElement(wp.components.IconButton, {
                    icon: "playlist-video",
                    onClick: openModal,
                    isLarge: !0,
                },
                    contentHTML ? __('Edit', 'anyclip-media') : __("AnyClip Playlist", "anyclip-media")
                ),

                modalView,

            ),
        );
    },
    save: function ({attributes: { contentHTML }}) {
        return wp.element.createElement(wp.element.RawHTML, null, contentHTML);
    }
});