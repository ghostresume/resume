/*===================================================================*/
(function () {
    if (window.console == undefined) {
        window.console = {
            log:function () {
            }
        };
    }
    window.createGetOrSet = function createGetOrSet(getter, setter, scope) {
        return (function () {
            if (arguments.length < 1) {
                return (getter.apply(scope || this, arguments));
            } else {
                return (setter.apply(scope || this, arguments));
            }
        });
    };

    window.BasicBtn = function BasicBtn(btn) {
        var $btn = btn;
        var isSelected = false;
        var isOver = false;

        $btn.isSelected = createGetOrSet(function () {
            return (isSelected);
        }, function () {
            isSelected = arguments[0];
            $btn.updateStatus();
        }, $btn);

        $btn.isOver = createGetOrSet(function () {
            return (isOver);
        }, function () {
            isOver = arguments[0];
            $btn.updateStatus();
        }, $btn);

        $btn.updateStatus = function () {
            // alert("updateStatus "+$btn.isOver());
            if ($btn.isSelected()) {
                $btn.removeClass("btnOver");
                $btn.addClass("btnSelected");
            } else {
                $btn.removeClass("btnSelected");
                if ($btn.isOver()) {
                    $btn.addClass("btnOver");
                } else {
                    $btn.removeClass("btnOver");
                }
            }
        };

        $btn.bind("mouseover", overHandle);
        $btn.bind("mouseout", outHandle);
        $btn.bind("click", clickHandle);

        function overHandle() {
            $btn.isOver(true);
        }

        function outHandle() {
            $btn.isOver(false);
        }

        function clickHandle() {

        }


        $btn.toString = function () {
            return ("btn");
        };
        return ($btn);
    };

    window.Btns = function Btns($btns, clazz) {
        var clazz = clazz || BasicBtn;
        var selectedIndex = -1;
        var __btns = [];
        init();

        function init() {
            $btns.each(function (index, element) {
                var btn = new clazz($(this));
                btn.bind("click", function (event) {
                    var i = $(this).index();
                    setSelectedIndex.apply($btns, [i]);
                });
                __btns.push(btn);
            });
        }

        function setSelectedIndex(i) {
            if (i != selectedIndex) {
                selectedIndex = i;
                $.each(__btns, function (index, item) {
                    // alert(item);
                    item.isSelected(i == index);
                });

                $btns.triggerHandler("selectedIndexChange", [i]);
            }
        }


        $btns.btns = __btns;
        $btns.selectedIndex = createGetOrSet(function () {
            return (selectedIndex);
        }, function () {
            setSelectedIndex(arguments[0]);
        }, $btns);
        return ($btns);
    };
})();

/*===================================================================*/
(function () {
    window.HeadBtn = function HeadBtn(btn) {
        var $super = BasicBtn(btn);
        var super_updateStatus = $super.updateStatus;
        var $btn = btn;
        var oldWidth = $btn.width();
        $btn.updateStatus = function () {
            super_updateStatus();
            var w = oldWidth;
            if ($btn.isSelected()) {
                w = w + 50;
            } else {
                if ($btn.isOver()) {
                    w = w + 10;
                }
            }
            $btn.stop().animate({
                width:w
            }, 500);
        };
        return ($btn);
    };
})();
/*=============================页面Pages======================================*/
(function () {
    window.PageSwitch = function PageSwitch(divs) {

        var $divs = divs;
        var currentIndex = -1;
        $divs.css("display", "none");

        function setCurrentIndex(index) {
            if (currentIndex == -1) {
                fisrtShow(index);
                //派发事件
                $divs.eq(currentIndex).triggerHandler("showPage");
            } else if (currentIndex != index) {
                showTo(index);
                $divs.eq(currentIndex).triggerHandler("showPage");
            } else {
                return;
            }

        }

        function fisrtShow(index) {
            var current = $($divs.get(index));
            //alert(current);
            current.css("top", "0px");
            current.css("left", "0px");
            current.stop().fadeIn(500);
            currentIndex = index;
            //
            current.parent().stop().animate({
                height:current.outerHeight() + "px"
            }, 800);
            //
            bindHeight(current);
        }

        function bindHeight(current, isbind) {
            current.bind("pageHeighChange", function (event, hei) {
                /*alert("recieve");*/
                var $this = $(this);
                var parent = $this.parent();
                var toHei = (!!hei) ? hei : $this.outerHeight() + 10;

                var due = caculateDue(parent.height() - toHei);
                parent.stop().animate({
                    height:toHei + "px"
                }, due);
            });
        }

        function unbindHeight(old) {
            old.unbind("pageHeighChange");
        }

        function caculateDue(deta) {
            return Math.min(Math.abs(deta) / 80 * 100, 800);
        }

        function showTo(index) {
            //var dir=currentIndex<index?1:-1;
            var dir = 1;

            var old = $($divs.get(currentIndex));
            unbindHeight(old);

            var current = $($divs.get(index));
            var parent = current.parent();
            current.stop();

            current.css('z-index', parseInt(old.css('z-index')) + 5);
            current.css("top", "0px");
            current.css("left", dir * 1000 + "px");

            var toHei = current.outerHeight();
            var due1 = 500, due2 = caculateDue(parent.height() - toHei);
            var delay1, delay2;
            if (toHei > parent.height()) {
                delay1 = 0;
                delay2 = due1;
            } else {
                delay1 = due2;
                delay2 = 0;
            }

            current.fadeIn(0).delay(delay1).animate({
                "left":"0px"
            }, {
                duration:due1,
                complete:function () {
                    old.css("display", "none");
                    bindHeight(current);
                }
            });
            //
            parent.stop().delay(delay2).animate({
                height:toHei + "px"
            }, due2);

            //
            currentIndex = index;
        }


        $divs.currentIndex = createGetOrSet(function () {
            return (currentIndex);
        }, function () {
            setCurrentIndex(arguments[0]);
        }, $divs);
        return $divs;
    }
})();
/*=======================案例展示页面============================================*/
$(function () {
    //-----------------计算坐标-----------------------
    var itemWidth = 280, itemHeight = 220;
    var itemMarginX = 12, itemMarginY = 8;
    var itemNumX = 3;

    function caculatePositionX(index) {
        var x = (index % itemNumX) * (itemWidth + itemMarginX) + 21;
        return x;
    }

    function caculatePositionY(index) {
        var y = Math.floor(index / itemNumX) * (itemHeight + itemMarginY) + itemMarginY + 0;
        return y;
    }

    function caculateTotalHeight(num) {
        var h = Math.ceil(num / itemNumX) * (itemHeight + itemMarginY) + itemMarginY + 0;
        return h;
    }

    //一页显示多少个
    function caculatePageTotalNum() {
        if ($(window).height() < 768) {
            return (2 * 3);
        } else if ($(window).height() < 1100) {
            return (3 * 3);
        } else {
            return (4 * 3);
        }
        return (4 * 3);
        //$(window).height();
    }

    //----------------tween-----------------------
    var offsetPageHei = 135;

    function tweenContainer($container, num, due) {
        var h = caculateTotalHeight(num);
        //$container.stop();
        if (due > 0) {
            $container.animate({
                "height":h + "px"
            }, {
                duration:due,
                queue:false,
                /*step : function() {
                 box.trigger("pageHeighChange");
                 },*/
                complete:function () {
                    box.trigger("pageHeighChange", h + offsetPageHei);
                }
            });

        } else {
            $div.css("height", h + "px");
            /*box.trigger("pageHeighChange");*/
        }

        box.trigger("pageHeighChange", h + offsetPageHei);
    }

    function tweenItem($div, index, due, offset) {
        offset = offset || {
            x:0,
            y:0
        };
        //
        var x = caculatePositionX(index) + (offset.x || 0);
        var y = caculatePositionY(index) + (offset.y || 0);
        //$div.stop();
        if (due > 0) {
            $div.animate({
                "left":x + "px",
                "top":y + "px"
            }, {
                duration:due,
                queue:false
            });
        } else {
            $div.css("left", x + "px");
            $div.css("top", y + "px");
        }
    }

    //----------------create-----------------------
    var workData = $("#showcaseData>li");
    var $sampleItem = $("#showCaseBox>#sample");
    var box = $("#showCaseBox");
    var allItems = new Array();
    var currentItems = new Array();
    //防止第一次加载太慢，因为所有图片都要加载。
    var isFirstShow = true;

    function init() {
        initNav();
        initPager();
        initItems();
        //延迟执行
        setTimeout(function () {
            navs.selectedIndex(1);
            isFirstShow = false;
            //filter("favourite")
        }, 1000);
    }

    function initItems() {
        $sampleItem.css("display", "none");
        //for(var i = 0; i < 10; i++) {
        workData.each(function (index) {
            var $div = create($(this), index);
            tweenItem($div, index, 0.5);
            allItems.push($div);
        });

        //}
        //alert(workData.size());
        currentItems = [];
        tweenContainer(box, currentItems.length, 500);
    }


    // new Image('img/zoom.PNG');
    function create($data, index) {
        var $div = $sampleItem.clone();
        $div.removeAttr("id").css("display", "block");
        //
        var tag = $data.attr("tags").toLowerCase();
        $div.attr("tags", tag);
        $div.attr("itemIndex", $data.index());
        //console.log($(".title", $data).text());
        //alert($(".title", $data).text())
        var thumb = $(".thumb>a.img", $data).attr("href");
        $div.data('thumb', thumb);
        delayShowPic($div, index * 50 + 10000);

        $(".title", $div).html($(".title", $data).html());
        $(".date", $div).html($(".date", $data).html());
        $(".detail", $div).html($(".detail", $data).html());
        $('.info', $div).css("opacity", 0.9);
        //
        var rank = $data.attr('rank') || 0;
        $div.attr('rank', rank);
        $div.data('rank', rank);
        $(".rank", $div).html(createStar(rank));
        //

        $div.mouseenter(function () {
            $(this).addClass("item_hover");
            //$(".meta", this).slideDown("fast");
            $(".detail", this).slideDown("fast");
            $('img.thumb', this).animate({top:'18px'}, 'fast');

            var tags = $(this).attr("tags");
            highlightNavByTag(tags);
            //alert($(".info", this).outerHeight());
            //$("img", this).animate({{${2:param1: value1, ${5:param2: value2}}}, speed)();}}
        });

        $div.mouseleave(function () {
            $(this).removeClass("item_hover");
            //$(".meta", this).slideUp("fast");
            $(".detail", this).slideUp("fast");
            $('img.thumb', this).animate({top:'0px'}, 'fast');
            highlightNavByTag("");
        });
        //$(".detail", $div).css("display", "none");
        //链接
        var $link = $(".thumb>a.link", $data);
        if ($link.size() == 1) {
            $('.link', $div).css('display', 'inline');
            $div.css({
                cursor:"pointer"
            });
            $div.attr("title", "请点击观看");
            $div.click(function () {
                window.open($link.attr("href"));
            })
        }
        //大图
        var gallery = $('.gallery', $data);
        var galleryItems = $('>div:not(.info)', gallery);
        if (gallery.size() >= 1) {
            $div.css({
                cursor:"pointer"
            });
            $div.attr("title", "请点击看大图");

            $div.click(function () {
                buildGallery(gallery, galleryItems);
            });
        }
        //box.append($div);
        return ($div);
    }

    function createStar(num) {
        var str = '';
        for (var i = 0; i < 5; i++) {
            str += i < num ? '★' : '<span style="color:#555">★</span>';
        }
        return(str);
    }

    function buildGallery(gallery, galleryItems) {
        $('>a', galleryItems).lightBox({
            overlayBgColor:'#000',
            overlayOpacity:0.6,
            imageLoading:'img/lightbox-ico-loading.gif',
            imageBtnClose:'img/lightbox-btn-close.gif',
            imageBtnPrev:'img/lightbox-btn-prev.gif',
            imageBtnNext:'img/lightbox-btn-next.gif',
            imageBlank:'img/lightbox-blank.gif',
            containerResizeSpeed:350,
            containerBorderSize:10,
            txtImage:$('>div.info', gallery).html() || "",
            txtOf:'/'
        }).eq(0).click();
    }


    //----------------nav-----------------------
    var navs = $("#showCaseNav>li");

    function initNav() {
        //
        $("#showCaseNavContainer").hover(
            function () {
                $(this).addClass('showCaseNav_over');
            },
            function () {
                $(this).removeClass('showCaseNav_over');
            }).attr("title", "请点选一个Tag");
        //
        navs = new Btns(navs, BasicBtn);

        navs.bind("selectedIndexChange", function (event, index) {
            navs.selectedIndex(index);
            var tag = $(navs.get(index)).attr("tag");
            //alert(tag);
            filter(tag);
        });
        //
    }

    //鼠标划到案例上，显示相关的tags
    function highlightNavByTag(tags) {
        for (var i = 0; i < navs.btns.length; i++) {
            var $this = navs.btns[i];
            if (!$this.isSelected()) {
                if (isInTags($this.attr("tag"), tags)) {
                    $this.addClass("highlight")
                } else {
                    $this.removeClass("highlight")
                }
            }
        }
    }

    //==================Pager===========================
    //一页显示多少个
    var pageTotalNum = caculatePageTotalNum();
    var $pagerContainer = $(".showCasePagger>.pager");
    var $pagerSample = $("#pagerSample", $pagerContainer);

    function initPager() {
        $pagerSample.css("display", "none");
    }

    //根据pageIndex(从0开始)，找出该页的范围；
    function getPageItems(totalsItems, pageIndex) {
        var start = pageIndex * pageTotalNum;
        var end = Math.min((pageIndex + 1) * pageTotalNum, totalsItems.length);
        var getPageItems = totalsItems.slice(start, end);
        console.log("\titem: [" + start + "~" + end + ")/" + totalsItems.length);
        return (getPageItems);
    }

    //根据pageIndex(从0开始)，创建翻页器
    function createPage(totalsItems, pageIndex) {
        $pagerContainer.empty();
        var totalpages = Math.ceil(totalsItems.length / pageTotalNum);
        console.log("\tpage: " + pageIndex + "/" + totalpages);
        //
        if (totalpages > 1) {
            $pagerContainer.append(createPager("<", Math.max(pageIndex - 1, 0), false));
            for (var i = 0; i < totalpages; i++) {
                $pagerContainer.append(createPager(i + 1, i, i == pageIndex));
            }
            $pagerContainer.append(createPager(">", Math.min(pageIndex + 1, totalpages - 1), false));
        }
    }

    function createPager(text, index, isCurrent) {
        $no = $pagerSample.clone().removeAttr("id").css("display", "inline");
        $no.text(text);

        if (!isCurrent) {
            $no.click(function () {
                onPagerClick(index);
            });
            $no.hover(function () {
                $(this).addClass("pageNumOver");
            }, function () {
                $(this).removeClass("pageNumOver");
            })
        } else {
            $no.addClass("pageNumCurrent");
        }
        return ($no);
    }

    function onPagerClick(index) {
        console.log("page" + index);
        filter(currentTag, index);
    }

    //================Filter=============
    var currentTag = "";
    var currentIndex = -1;
    var currentTagFilter = [];

    function filter(tag, pageIndex) {
        pageIndex = (pageIndex == undefined) ? 0 : pageIndex;
        //
        if (tag == currentTag && pageIndex == currentIndex) {
            return;
        }
        console.log("goto>>:" + tag + " " + pageIndex);
        //
        var filters;
        //按标签筛选
        if (currentTag != tag) {
            currentTagFilter = filters = getFilterArray(tag);
            currentIndex = pageIndex = 0;
            if (tag != '*') {
                //排序
                currentTagFilter.sort(function (a, b) {
                    var i = parseInt(b.data('rank') * 100) - parseInt(a.data('rank') * 100);
                    return (i);
                });
            }
        } else {
            filters = currentTagFilter;
            currentIndex = pageIndex;
        }


        //按页面筛选
        createPage(filters, currentIndex);
        filters = getPageItems(filters, pageIndex);
        //显示
        showFilter(filters);
    }

    function isInTags(tag, tags) {
        tags = "|" + tags.toLowerCase() + "|";
        tag = "|" + tag.toLowerCase() + "|";
        var has = (tags.indexOf(tag) != -1);
        return has;
    }

    function getFilterArray(tag) {
        if (tag == "*") {
            return allItems.concat();
        }
        var filters = new Array();
        for (var i = 0; i < allItems.length; i++) {
            if (isInTags(tag, allItems[i].attr("tags"))) {
                filters.push(allItems[i]);
            }
        }
        return filters;
    }

    //=====================================================
    function showFilter(filters) {
        //剔除
        currentItems = removeUnFilters(filters);
        //添加
        currentItems = rePositionNew(filters);
        //容器高度
        tweenContainer(box, filters.length, 500);
    }

    //剔除不需要的
    function removeUnFilters(filters) {
        var due = 0;
        var leftArr = new Array();
        for (var i = 0; i < currentItems.length; i++) {
            var $div = currentItems[i];
            if (jQuery.inArray($div, filters) == -1) {
                removeOld($div, 500);
                tweenItem($div, i, 500, {
                    x:-itemWidth
                });
                due = 500;
            } else {
                leftArr.push($div);
            }
        }
        return (leftArr);
    }

    //随机交换
    function randomSwap(arr) {
        var len = (Math.random() + 1) * arr.length();
        for (var i = 0; i < len; i++) {
            var ri = (Math.random()) * arr.length();
            var rj = (Math.random()) * arr.length();
            var temp = arr[ri];
            arr[ri] = arr[rj];
            arr[rj] = temp;
        }
        return (arr);
    }

    //添加需要的
    function rePositionNew(filters) {
        for (var i = 0; i < filters.length; i++) {
            var $div = filters[i];
            if (jQuery.inArray($div, currentItems) == -1) {
                $div.stop();
                tweenItem($div, i, 0, {
                    x:itemWidth / 2
                });
                box.append($div);
                //防止第一次加载太慢
                var delay = isFirstShow ? 10 * i + 300 : 10 * i;
                delayShowPic($div, delay);
                //
                $div.fadeIn(500);
                tweenItem($div, i, 500);
            } else {
                tweenItem($div, i, 500);
            }
        }
        return (filters);
    }

    function delayShowPic($div, delay) {
        setTimeout(function () {
            $("img.thumb", $div).bind('load',
                function () {
                   $(this).siblings('.thumLoading').remove();
                }
            ).attr('src', $div.data('thumb'));
        }, delay);
    }

    function removeOld($tobeRemoved, due) {
        $tobeRemoved.fadeOut(due, function () {
            $(this).detach();
        });
    }

    init();
})
;
/*==========================resumePage=========================================*/
$(function () {
    var $items = $("#resumePage .jobItem");
    $items.mouseover(function () {
        open.apply(window, [$(this).index()]);
        /*alert($(".detail", $(this)).html());*/
    });
    var current = -1;

    function open(i) {
        if (i != -1 && i != current) {
            current = i;
            $items.each(function (index, item) {
                var detail = $(".detail", $(this));
                detail.stop();
                tween(detail, (index == i));
                /*
                 if(index == i) {
                 detail.slideDown();
                 } else {
                 detail.slideUp();
                 }*/
            })
        }
    }

    function tween($div, open) {
        var hei = open ? $div.attr('hei') || 150 : 0;
        $div.animate({
            height:hei + "px"
        }, {
            duration:500,
            queue:false
        })
        if (open) {
            $div.parent().addClass("jobItemOver");
        } else {
            $div.parent().removeClass("jobItemOver");
        }
    }

    open(0);
});
/*===================================start================================*/
$(function () {
    var currentPageIndex = -1;
    var pages = new PageSwitch($("#pageWraper>div.page"));
    var mainnav = new Btns($("#mainNav>li"), HeadBtn);

    function init() {
        $("a[href]", mainnav).each(function (index) {
            var $this = $(this);
            var $parent = $this.parent();
            var href = $this.attr("href").toLowerCase();
            $parent.data("href", href);
            $this.removeAttr("href");
        });

        //
        mainnav.bind("selectedIndexChange", function (event, index) {
            gotoPage(index);
        });
        //
        SWFAddress.onInit = function () {
            SWFAddress.onExternalChange = function () {
                onExternalChange.apply(window);
            };
            onExternalChange.apply(window);
            onStart();
        };
    }

    function onStart() {
        $('#mainWraper').css({visibility:"visible"});
    }


    function gotoPage(i) {
        //alert(i);
        if (currentPageIndex != i) {
            currentPageIndex = i;
            //
            mainnav.selectedIndex(i);
            pages.currentIndex(i);
            //
            var href = $(mainnav.get(i)).data("href").split("#").join("");
            ///alert("href " + href);
            SWFAddress.setValue(href);
        }
    }

    function onExternalChange() {
        var path = SWFAddress.getPath().toLowerCase().split("/").join("");
        //alert(path);
        var finded = false;
        mainnav.each(function () {
            var link = $(this).data("href");
            link = link.toLowerCase();
            link = link.split("/").join("");
            link = link.split("#").join("");
            if (path.indexOf(link) == 0) {
                gotoPage($(this).index());
                finded = true;
                return false;
            }
        });
        //
        if (!finded) {
            gotoPage(0);
        }
    }

    init();
});
