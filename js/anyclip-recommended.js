const aspectRatios = ['16:9', '9:16', '4:3', '3:4', '1:1'];

const selectStyles = {
    'padding': '0 10px',
    'border': '1px solid #dbdbdb',
    'border-radius': 0,
    'font-size': '14px',
    'display': 'block',
    'width': '200px',
    'margin': '0 18px 14px 0',
    'height': '40px',
    'cursor': 'pointer',
};

const playersRequestUrl =  constants.ANYCLIP_API_URL + '/private/publisher/players-for-wordpress-plugin';

const getSrcRequestUrl =  constants.ANYCLIP_API_URL + '/private/tt/editorial/player';

wp.blocks.registerBlockType('anyclip/recommended-box', {
    title: 'AnyClip Recommended',
    description: 'Block inserts anyclip player',
    icon: 'editor-video',
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
        player: {
            type: 'number',
        },
        aspectRatio: {
            type: 'string',
        },
        playersList: {
            type: 'array',
        }
    },

    edit: function (props) {
        console.log('Logger: edit');
        const { attributes: { contentHTML, player, aspectRatio, playersList }, setAttributes } = props;
        const postTitle = wp.data.select('core/editor').getCurrentPostAttribute('title');

        const msgEventListener = (msg) => {
            if (msg && msg.data && msg.data.type === 'ac_editor_login') {
                localStorage.setItem('pcn/creds', msg.data.token);
                closeModal();
                setTimeout(() => showPlayers(), 500)
            }
        };

        function showPlayers () {
            console.log('Logger: showPlayers');
            window.removeEventListener("message", msgEventListener);
            const token = localStorage.getItem('pcn/creds');
            const publisherId = token ? parseJwt(token).publisherId : null;
            if (publisherId) {
                fetch(`${playersRequestUrl}`, {
                    method: 'GET',
                    headers: new Headers({
                        'Authorization': localStorage.getItem('pcn/creds'),
                    }),
                    credentials: 'include',
                })
                .then(res => res.json())
                .then(res => {
                    if (Array.isArray(res)) {
                        setAttributes({
                            playersList: res.sort((a, b) => a.alias.localeCompare(b.alias)),
                            isModalOpen: true,
                        });
                    } else if (res.status && (res.status === 401 || res.status === 403)) {
                        localStorage.removeItem('pcn/creds');
                        setAttributes({
                            isModalOpen: true,
                        });
                    }
                    if (!player) {
                        setAttributes({
                            player: playersList && playersList[0].id,
                            aspectRatio: aspectRatios[0],
                        });
                    }
                }).catch(err => console.log('SOMETHING BAD HAPPENED:', err));
            } else {
                window.addEventListener("message", msgEventListener, false);
                setAttributes({
                    isModalOpen: true,
                });
            }
        }

        function selectPlayer(e) {
            setAttributes({ player: e.target.value });
        }

        function selectRatio(e) {
            setAttributes({ aspectRatio: e.target.value });
        }

        function closeModal() {
            console.log('Logger: closeModal');
            setAttributes({
                isModalOpen: false,
            });
            window.removeEventListener("message", msgEventListener, false);
        }

        function doInsert() {
            console.log('Logger: doInsert');
            const aspectRatio = jQuery('#aspect-selector').val();
            const player = jQuery('#player-selector').val();
            setAttributes({
                isModalOpen: false,
            });

            window.removeEventListener("message", msgEventListener, false);

            fetch(`${getSrcRequestUrl}/${player}?aspectRatio=${aspectRatio}`, {
                method: 'GET',
                headers: new Headers({
                    'Authorization': localStorage.getItem('pcn/creds'),
                }),
                credentials: 'include',
            })
                .then(res => res.json())
                .then(res => {
                    const { embedCode } = res;
                    setAttributes({
                        contentHTML: embedCode,
                    });
                })
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
            console.log('Logger: isModalOpen');

            const aspects = ['select',  {
                style: selectStyles,
                onChange: selectRatio,
                id: 'aspect-selector',
                value: aspectRatio,
            }];

            aspectRatios.forEach(ratio => {
                aspects.push(wp.element.createElement('option', { value: ratio }, ratio));
            });

            const players = ['select', {
                style: selectStyles,
                onChange: selectPlayer,
                id: 'player-selector',
                value: player,
            }];

            playersList && playersList.forEach(e => {
                players.push(wp.element.createElement('option', { value: e.id }, e.alias));
            });

            const selectView = wp.element.createElement(wp.components.Modal, {
                    shouldCloseOnEsc: true,
                    isDefault: true,
                    shouldCloseOnClickOutside: false,
                    onRequestClose: closeModal,
                    title: 'Choose Player',
                },
                wp.element.createElement(
                    'div',
                    { className: 'recommended-modal' },
                    wp.element.createElement(
                        'div',
                        { className: 'recommended-wrapper' },
                        wp.element.createElement.apply(null, players),
                        wp.element.createElement.apply(null, aspects),
                    ),
                    wp.element.createElement(
                        'p',
                        { className: 'recommended-description' },
                        "Recommended videos will be available after you publish the post. You won't be able to view recommended video on the post preview"
                    ),
                    wp.element.createElement(
                        'div',
                        { className: 'recommended-buttons-wrapper' },
                        wp.element.createElement(
                            'button',
                            { className: 'recommended-insert-button', onClick: doInsert },
                            'Insert Into Post'
                        ),
                        wp.element.createElement(
                            'button',
                            { className: 'recommended-cancel-button', onClick: closeModal },
                            'Cancel'
                        )
                    )
                ),
            );

            const loginView =  wp.element.createElement(wp.components.Modal, {
                    shouldCloseOnEsc: true,
                    isDefault: true,
                    shouldCloseOnClickOutside: false,
                    onRequestClose: closeModal,
                    title: wp.element.createElement(
                        'div',
                        { className: 'video-playlist-title-wrapper' },
                        wp.element.createElement('img', {
                            src: `${window.constants.ANYCLIP_ASSETS_URL}/anyclip-logo-transparent.png`,
                            width: '83px',
                        }),
                        wp.element.createElement('span', { className: 'title' }, 'Insert AnyClip Recommended')
                    ),
                },
                wp.element.createElement("iframe", {
                    src: `${constants.ANYCLIP_LOGIN_URL}`,
                    className: 'anyclip-media-iframe'
                }),
            );

            modalView = localStorage.getItem('pcn/creds') ? selectView : loginView;
        }

        return wp.element.createElement(
            wp.element.Fragment,
            null,
            wp.element.createElement(
                'div',
                {
                    className: "components-placeholder",
                },

                wp.element.createElement(wp.components.Icon, {
                        icon: 'editor-video',
                        size: 320,
                    },
                    ''
                ),
                wp.element.createElement(wp.components.IconButton, {
                        icon: "editor-video",
                        onClick: showPlayers,
                        isLarge: !0,
                    },
                    contentHTML ? __('Edit', 'anyclip-media') : __("AnyClip Recommended", "anyclip-media")
                ),

                modalView,

            ),
        );
    },
    save: function ({ attributes: { contentHTML }}) {
        return wp.element.createElement(wp.element.RawHTML, null, contentHTML);
    }
});