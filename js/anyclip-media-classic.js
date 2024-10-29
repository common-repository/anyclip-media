jQuery(document).ready(function ($) {
    const parseJwt = (token) => {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    };

    const playersRequestUrl = constants.ANYCLIP_API_URL + '/private/publisher/players-for-wordpress-plugin';

    const getSrcRequestUrl = constants.ANYCLIP_API_URL + '/private/tt/editorial/player';

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

    const recommendedWrapperStyles = {
        'display': 'flex',
        'margin': '14px',
    };

    const buttonsWrapperStyles = {
        'display': 'flex',
        'justify-content': 'flex-end',
    };

    const insertButtonStyles = {
        'background': 'rgb(0, 82, 204)',
        'height': '32px',
        'color': 'white',
        'margin': '0 4px',
        'font-family': 'Arial',
        'cursor': 'pointer',
        'border': '0',
        'font-size': '14px',
        'padding': '0 15px',
    };

    const cancelButtonStyles = {
        'background': 'none',
        'height': '32px',
        'color': 'rgb(80, 95, 121)',
        'margin': '0 4px',
        'font-family': 'Arial',
        'cursor': 'pointer',
        'border': '0',
        'font-size': '14px',
        'padding': '0 15px',
    };

    const recommendedDescriptionStyles = {
    'color': '#f33',
    'font-size': '14px',
    };

    const content = document.getElementById('anyclip-recommended-content');

    let playersList = null;
    let player = null;
    let aspectRatio = null;

    const selectorWrapper = document.createElement('div');
    selectorWrapper.className = 'recommended-wrapper';
    applyStyles(selectorWrapper, recommendedWrapperStyles);

    const description = document.createElement('p');
    description.innerHTML = "Recommended videos will be available after you publish the post. You won't be able to view recommended video on the post preview";
    description.className = 'recommended-description';
    applyStyles(description, recommendedDescriptionStyles);

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'recommended-buttons-wrapper';
    applyStyles(buttonsWrapper, buttonsWrapperStyles);

    const insertButton = document.createElement('button');
    insertButton.innerHTML = 'Insert Into Post';
    insertButton.className = 'recommended-insert-button';
    insertButton.onclick = doInsertRecommended;
    buttonsWrapper.appendChild(insertButton);
    applyStyles(insertButton, insertButtonStyles);

    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';
    cancelButton.className = 'recommended-cancel-button';
    cancelButton.onclick = closeModal;
    buttonsWrapper.appendChild(cancelButton);
    applyStyles(cancelButton, cancelButtonStyles);

    if (content) {
        content.appendChild(selectorWrapper);
        content.appendChild(description);
        content.appendChild(buttonsWrapper);
    }

    window.addEventListener("message", (msg) => {
        if (msg && msg.data && msg.data.embed) {
            doInsert({
                embedCode: msg.data.embed.embedCode || msg.data.embed,
                thumbnail: msg.data.thumbnail,
                playlistId: msg.data.playlistId
            });
            closeModal();
        }
        if (msg && msg.data.type === 'ac_editor_login') {
            const tbIframe = document.getElementById('TB_iframeContent');
            localStorage.setItem('pcn/creds', msg.data.token);
            if (tbIframe?.src
                && new URL(tbIframe.src).search
                && new URLSearchParams(new URL(tbIframe.src).search).get('type')?.slice(0, -1) === 'recommended'
                ) {
                closeModal();
                setTimeout(() => showRecommendedModal(), 1000);
            }
        }
    }, false);

    function applyStyles (element, styles) {
        for (key in styles) {
            element.style[key] = styles[key]
        }
    }

    function closeModal() {
        tb_remove();
    }

    function selectPlayer(e) {
        player = e.target.value;
    }

    function selectRatio(e) {
        aspectRatio = e.target.value;
    }

    function createAspectsSelector() {
        if ($('#aspect-selector').length) {
            return;
        }
            const aspectsSelector = document.createElement('select');
            aspectsSelector.id = 'aspect-selector';
            aspectsSelector.onchange = selectRatio;

            applyStyles(aspectsSelector, selectStyles);

            aspectRatios.forEach(ratio => {
                const option = document.createElement('option');
                option.value = ratio;
                option.text = ratio;
                aspectsSelector.appendChild(option);
            });
            selectorWrapper.appendChild(aspectsSelector);
    }

    function createPlayersSelector(players = []) {
        if ($('#player-selector').length) {
            return;
        }
        const playersSelector = document.createElement('select');
        playersSelector.id = 'player-selector';
        playersSelector.onchange = selectPlayer;

        applyStyles(playersSelector, selectStyles);

        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.text = player.alias;
            playersSelector.appendChild(option);
        });
        selectorWrapper.appendChild(playersSelector);
    }

    function showPlayers() {
        const token = localStorage.getItem('pcn/creds');
        const publisherId = token ? parseJwt(token).publisherId : null;
        if (publisherId) {
            fetch(`${playersRequestUrl}/${publisherId}/players`, {
                method: 'GET',
                headers: new Headers({
                    'Authorization': localStorage.getItem('pcn/creds'),
                }),
                credentials: 'include',
            })
            .then(res => res.json())
            .then(res => {
                if (Array.isArray(res)) {
                    playersList = res.sort((a, b) => a.alias.localeCompare(b.alias));
                    createPlayersSelector(playersList);
                    createAspectsSelector();
                    if (!player) {
                        player = playersList[0].id;
                        aspectRatio = aspectRatios[0];
                    }
                    
                $('#TB_load').remove();
                tb_show('', '/?TB_inline&inlineId=anyclip-recommended-content&width=540&height=245');
                resizeTBIframeRecommended();
                return showTitleAndIcon('Choose player');
                } else if (res.status && res.status === 401) {
                    tb_show('', constants.ANYCLIP_LOGIN_URL + '?TB_iframe=true&width=1024');
                    return showTitleAndIcon('Insert AnyClip Recommended');
                }
            }).catch(err => console.log('SOMETHING BAD HAPPENED:', err));
        }
    }

    function doInsert(data) {
        const acRegEx = new RegExp(/\[anyclip-media([^\]]*)\]([^\]]*)\[\/anyclip-media\]/g);

        let editorContent = getMceContent();

        if (editorContent && editorContent.match(acRegEx)) {
            editorContent = editorContent.replace(acRegEx, () => generateShortCode(data));

            var activeEditor = tinymce.activeEditor ? tinymce.activeEditor : null;
            if (activeEditor) {
                activeEditor.setContent(editorContent);
            } else {
                $('textarea.wp-editor-area#content').val(editorContent);
            }
        } else {
            //window.parent.send_to_editor(generateShortCode(data));
        }
    }

    function doInsertRecommended() {
        const aspectRatio = jQuery('#aspect-selector').val();
        const player = jQuery('#player-selector').val();

        closeModal();

        fetch(`${getSrcRequestUrl}/${player}?aspectRatio=${aspectRatio}`, {
            method: 'GET',
            headers: new Headers({
                'Authorization': localStorage.getItem('pcn/creds'),
            }),
            credentials: 'include',
        })
            .then(res => res.json())
            .then(res => doInsert(res))
            .catch(err => console.log('SOMETHING BAD HAPPENED:', err));
    }

    function generateShortCode(data) {
        const shortCodeTamplate = '[anyclip-media thumbnail="%thumbnail%" playlistId="%playlistId%" content="%embedCode%"][/anyclip-media]';
        let shortCode = shortCodeTamplate.replace('%thumbnail%', data.thumbnail);
        shortCode = shortCode.replace('%playlistId%', data.playlistId);
        shortCode = shortCode.replace('%embedCode%', btoa(data.embedCode));

        return shortCode;
    }

    function getMceContent() {
        if (jQuery("#wp-content-wrap").hasClass("tmce-active")) {
            return tinyMCE.activeEditor.getContent();
        } else {
            return jQuery('textarea.wp-editor-area#content').val();
        }
    }
    
    const resizeTBIframe = () => {
        const tb = document.getElementById('TB_window');

        if (tb) {
            const rawWidth = window.innerWidth * 0.9;
            const width = rawWidth < 1024 ? 1024 : rawWidth;
            const height = 85;
            tb.setAttribute('style',
            `width: ${width}px; height: ${height}vh; left: 50%; top: 52px; margin-left: -${width/2}px; margin-top: 0px; visibility: visible;`);
            const tbIframe = document.getElementById('TB_iframeContent');
            tbIframe.setAttribute('style', `width: ${width}px; height: ${height}vh;`);
        }
    };

    const resizeTBIframeRecommended = () => {
        const tb = document.getElementById('TB_window');

        if (tb) {
            const width = 590;
            const height = 240;
            tb.setAttribute('style',
                `width: ${width}px; height: ${height}px; left: 50%; top: 35%; margin-left: -${width/2}px; margin-top: 0px; visibility: visible;`);
        }
    };

    function showTitleAndIcon(subtitle) {
        const icon = document.createElement('img');
        icon.src = `${window.constants.ANYCLIP_ASSETS_URL}/anyclip-logo-transparent.png`;
        icon.width = 77;
        icon.height = 40;

        const text = document.createElement('div');
        text.innerHTML = subtitle; // @codingStandardsIgnoreLine

        const block = document.createElement('div');
        block.setAttribute('style', 'padding: 5px; width: 77px; display: inline-block');
        block.appendChild(icon);

        const title = document.getElementById('TB_ajaxWindowTitle');
        if (title) {
            title.setAttribute('style', 'display: flex');
            title.appendChild(block);
            title.appendChild(text);
        }

    }

    function showRecommendedModal () {
        const token = localStorage.getItem('pcn/creds');
        if (!token) {
            tb_show('', constants.ANYCLIP_LOGIN_URL + '?type=recommended' + '?TB_iframe=true&width=1024');
            return showTitleAndIcon('Insert AnyClip Recommended');
        }

        showPlayers();
    }

    function eduResModalShow (mode, subtitle) {
        /*if (!postOptions.title) {
            tinyMCE && tinyMCE.activeEditor.setContent('Save post with title before add AnyClip playlist.');
            return;
        }*/
        tb_show( '', constants.ANYCLIP_STUDIO_URL + mode + '?TB_iframe=true&width=1024' );
        showTitleAndIcon(subtitle);

        resizeTBIframe();
		return false;
    };
    
    const playlistButton = document.getElementById('playlistButton');
    playlistButton && playlistButton.addEventListener('click', () => (eduResModalShow(`?mode=wp&title=${postOptions.title}&u=${constants.ANYCLIP_USER_EMAIL}`, 'Insert AnyClip Playlist')));

    const videoButton = document.getElementById('videoButton');
    videoButton && videoButton.addEventListener('click', () => eduResModalShow(`?mode=wp_video&u=${constants.ANYCLIP_USER_EMAIL}`, 'Insert AnyClip Video'));

    const recommendedButton = document.getElementById('recommendedButton');
    recommendedButton && recommendedButton.addEventListener('click', () => showRecommendedModal());
    window.addEventListener('resize', resizeTBIframe);
});