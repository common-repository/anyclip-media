wp.blocks.registerBlockType('anyclip/video-box', {
    title: 'AnyClip Video',
    description: 'Block inserts anyclip player',
    icon: 'format-video',
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
        handler:{
            type: 'function'
        }
    },
    edit: function (props) { 
        const { attributes: { contentHTML, thumbnail, handler }, setAttributes } = props;
        let msgEventListener;
        if( ! handler ){
            msgEventListener = ( function( msg ) {
                if (msg && msg.data && msg.data.embed ) {
                    doInsert({
                        embedCode: msg.data.embed.embedCode,
                        thumbnail: msg.data.thumbnail,
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
            if (data.embedCode) {
                props.setAttributes({
                    contentHTML: data.embedCode,
                    thumbnail: data.thumbnail,
                });
            }
            window.removeEventListener("message", msgEventListener);
        }

        function closeModal() {
            setAttributes({
                isModalOpen: false,
            });
            window.removeEventListener("message", msgEventListener);
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
            updateContent(data);
        }

        setTimeout(() => changeButtonsColor(), 0);
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
                    icon: "format-video",
                    onClick: openModal,
                    isLarge: !0,
                },
                    contentHTML ? __('Edit', 'anyclip-media') : __("AnyClip Video", "anyclip-media")
                ),

                props.attributes.isModalOpen
                ?
                React.createElement(wp.components.Modal, {
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
                        wp.element.createElement('span', { className: 'title' }, 'Insert AnyClip Video')
                    ),
                },
                React.createElement("iframe", {
                    src: `${constants.ANYCLIP_STUDIO_URL}?mode=wp_video&login=wp&u=${constants.ANYCLIP_USER_EMAIL}`,
                    className: 'anyclip-media-iframe'
                }),
                ) 
                : null,

            ),
        );
    },
    save: function ({attributes: { contentHTML }}) {
        return wp.element.createElement(wp.element.RawHTML, null, contentHTML);
    }
});
