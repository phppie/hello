var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.initBBUI();
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    config: {},
    loadConfig: function() {
        if (!localStorage.getItem('firstrun')) {
            this.config['version'] = blackberry.app.version;
            this.config['darktheme'] = bb.device.is1280x768 ? false : true;
            this.config['wifionly'] = true;
            this.config['darkscreenbgColor'] = "#121212";
            this.config['darkscreencolor'] = "#eee";
            this.saveConfig();
            localStorage.setItem('firstrun', true);
        } else {
            this._loadConfig();
        }
    },
    saveConfig: function() {
        localStorage.setItem('config', JSON.stringify(this.config));
    },
    _loadConfig: function() {
        this.config = JSON.parse(localStorage.getItem('config'));

    },
    initBBUI: function() {
        this.loadConfig();
        bb.init({
            controlsDark: app.config.darktheme,
            listsDark: app.config.darktheme,
            onscreenready: function(e, id, param) {
                app.applyTheme(e);
                if (id === "main") {

                }
                if (id === "view") {

                }
                if (id === "selector") {
                    e.getElementById('datepicker').value = new Date().toISOString().substr(0, 10);
                }
                if (id === 'settings') {
                    app.loadSettings(e, id, param);
                }
            },
            ondomready: function(e, id, param) {
                if (id === "main") {
                    zhihu.getLatest(function(success, d) {
                        if (success) {
                            var df = View.buildList(d);
                            $("[data-bb-type=scroll-panel]").append(df);
                        } else {
                            Toast.regular("发生错误，错误信息为：" + JSON.stringify(d), 5000);
                            bb.popScreen();
                        }
                    });
                    $('.bb-titlebar-button').on("click", function() {
                        UI.showSelector();
                    });
                }
                if (id === "history") {
                    var prev = param['date'];
                    zhihu.getDailyBefore(prev, function(success, d) {
                        if (success) {
                            var df = View.buildList(d);
                            $("[data-bb-type=scroll-panel]").append(df);
                            $('[data-bb-type=panel-header]').text(d['date']);
                        } else {
                            Toast.regular("发生错误，错误信息为：" + JSON.stringify(d), 5000);
                            bb.popScreen();
                        }
                    });
                }
                if (id === "view") {
                    var url = param['url'];
                    zhihu.getContent(url, function(success, d) {
                        if (success) {
                            $('[data-bb-type=panel-header]').text(d.title);
                            $('.view-image').attr("src", d.image);
                            $('.view-image-by').text(d.image_source);
                            $('.view-body').html(d.body);
                            $('.view-body').find('a').each(function(i, e) {
                                var u = $(e).attr("href");
                                $(e).attr("href", "#").on("click", function() {
                                    window.open(u);
                                });
                            });
                            currentshareurl = d.share_url;
                        } else {
                            Toast.regular("发生错误，错误信息为：" + JSON.stringify(d), 5000);
                            bb.popScreen();
                        }
                    });
                    view_ab_show = true;
                    Hammer($("[data-bb-type=round-panel]")[0]).on("swipeup", function() {
                        $('#ab')[0].hide();
                        view_ab_show = false;
                    }).on("swipedown", function() {
                        $('#ab')[0].show();
                        view_ab_show = true;
                    }).on("swiperight", function() {
                        bb.popScreen();
                    });
                    var sc=$('[data-bb-type=screen]')[0].bbUIscrollWrapper;
                    
                    shortcut.remove("T");
                    shortcut.remove("B");
                    shortcut.remove("0");
                    shortcut.remove("space");

                    shortcut.add("T", function() {
                        $(sc).animate({'scrollTop':0},'fast')
                    });
                    shortcut.add("B", function() {
                        $(sc).animate({'scrollTop':$('[data-bb-type=round-panel]').height()},'fast')
                    });
                    shortcut.add("0", function() {
                        sc.scrollByPages(-1);
                    });
                    shortcut.add("space", function() {
                        sc.scrollByPages(1);
                        $('#ab')[0].hide();
                        view_ab_show = false;
                    });

                }
            }
        });
        bb.pushScreen('main.html', 'main');
        navigator.splashscreen.hide();
    },
    applyTheme: function(e) {
        bb.screen.controlColor = (app.config['darktheme']) ? 'dark' : 'light';
        bb.screen.listColor = (app.config['darktheme']) ? 'dark' : 'light';
        if (app.config.darktheme) {
            var screen = e.querySelector('[data-bb-type=screen]');
            if (screen) {
                screen.style['background-color'] = app.config.darkscreenbgColor;
                screen.style['color'] = app.config.darkscreencolor;
            }
            if (!document.body.classList.contains("dark")) {
                document.body.classList.add("dark");
            }
        } else {
            if (document.body.classList.contains("dark")) {
                document.body.classList.remove("dark");
            }
        }
    },
    loadSettings: function(e, id, p) {
        if (app.config['darktheme']) {
            e.getElementById('themeToggle').setAttribute('data-bb-checked', 'true');
        } else {
            e.getElementById('themeToggle').setAttribute('data-bb-checked', 'false');
        }
    },
    saveSettings: function(obj) {
        if (obj.checked) {
            app.config['darktheme'] = true;
        } else {
            app.config['darktheme'] = false;
        }
        app.saveConfig();
    }
};