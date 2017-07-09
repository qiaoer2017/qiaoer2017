;(function () {
    'use strict';

    var $form_add_task = $('.add-task');
    var $delete_task_trigger;
    var $detail_task_trigger;
    var $task_detail = $('.task-detail');
    var $task_detail_mask = $('.task-detail-mask');
    var task_list = [];
    var current_index;
    var $update_form;
    var $task_detail_content;
    var $task_detail_content_input;
    var $checkbox_complete;
    var $msg = $('.msg');
    var $msg_content = $msg.find('.msg-content');
    var $msg_confirm = $msg.find('.confirmed');
    var $alerter = $('.alerter');


    init();

    $form_add_task.on('submit', on_add_task_form_submit);
    $task_detail_mask.on('click', hide_task_detail);

    /*========函数定义区=========*/
    function init() {
        task_list = store.get('task_list') || [];
        listen_msg_event();
        if (task_list.length) {
            render_task_list();
        }
        task_remind_check();
    }

    function task_remind_check() {
        // show_msg("吃饭了");
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get_task(i);
                var task_timestamp;
                if (!item || !item.remind_date || item.informed) {
                    continue;
                }
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();
                if (current_timestamp - task_timestamp >= 1) {
                    show_msg(item.content);
                    update_task(i, {informed: true});
                }
            }
        }, 500);

    }

    function show_msg(msg) {
        if (!msg) {
            return;
        }
        $msg_content.html(msg);
        $alerter.get(0).play();
        $msg.show();
    }

    function hide_msg() {
        $msg.hide();
    }

    /*表单提交事件*/
    function on_add_task_form_submit(e) {
        var new_task = {};
        /*禁用默认行为*/
        e.preventDefault();
        /*获取新task的值*/
        var $input = $(this).find('input[name=content]');
        new_task.content = $input.val();

        /*如果新task的值为空，则直接返回，否则继续执行*/
        if (!new_task.content.trim()) {
            return;
        }
        /*存入新task*/
        if (add_task(new_task)) {
            $input.val(null);
        }
    }

    function listen_task_detail() {
        $detail_task_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            var index = $item.data('index');

            show_task_detail(index);
            console.log('index', index);
        })
    }

    function listen_checkbox_complete() {
        $checkbox_complete.on('click', function () {
            var $this = $(this);
            var index = $this.parent().parent().data('index');
            var item = get_task(index);
            if (item.complete) {
                update_task(index, {complete: false});
            } else {
                update_task(index, {complete: true});
            }
            // var is_complete = $this.is(':checked');
        })
    }

    function listen_msg_event() {
        $msg_confirm.on('click', function () {
            hide_msg();
        });
    }

    function get_task(index) {
        return store.get('task_list')[index];
    }

    /*查看task详情*/
    function show_task_detail(index) {
        render_task_detail(index);
        current_index = index;
        $task_detail.show();
        $task_detail_mask.show();
    }

    function update_task(index, data) {
        if (index === undefined || !task_list[index]) {
            return;
        }
        task_list[index] = $.extend({}, task_list[index], data);
        refresh_task_list();
    }

    function hide_task_detail(index) {
        $task_detail.hide();
        $task_detail_mask.hide();
    }

    /*渲染指定task的详细信息*/
    function render_task_detail(index) {
        if (index === undefined || !task_list[index]) {
            return;
        }
        var item = task_list[index];
        var tpl =
            '<form>' +
            '<div class="content">' +
            item.content +
            '</div>' +
            '<div class="input-item"><input style="display: none;" type="text" name="content" value="' + item.content + '"></div>' +
            '<div>' +
            '<div class="desc input-item">' +
            '<textarea name="desc">' + (item.desc ? item.desc : "") + '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind input-item">' +
            '<label>提醒时间</label>' +
            '<input type="text" class="datetime" name="remind_date" value="' + (item.remind_date || '') + '">' +
            '</div>' +
            '<div class="input-item"><button type="submit">更新</button></div>' +
            '</form>';

        $task_detail.html('');
        $task_detail.append($(tpl));
        $('.datetime').datetimepicker();

        $update_form = $task_detail.find('form');
        $task_detail_content = $update_form.find('.content');
        $task_detail_content_input = $update_form.find('[name=content]');
        $task_detail_content.on('dblclick', function () {
            // console.log('1', 1);
            $(this).hide();
            $task_detail_content_input.show();
        });

        // console.log('$update_form', $update_form);
        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();
            update_task(index, data);
            hide_task_detail();
        });
    }

    /*查找并监听所有删除按钮的点击事件*/
    function listen_task_delete() {
        $delete_task_trigger.on('click', function () {
            var $this = $(this);
            /*找到删除按钮所在的task元素*/
            var $item = $this.parent().parent();
            var index = $item.data('index');
            /*确认删除*/

            sweetAlert({
                title: "你确定要删除吗？",
                text: "删除过后不能恢复！",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm: false
            }, function () {
                delete_task(index);
                swal("删除成功！",
                    "该条清单已被删除！",
                    "success");
            });

            // if (confirm('确定删除吗？')) {
            //
            // }
        });
    }

    function add_task(new_task) {
        /*将新task推入task_list*/
        task_list.push(new_task);
        refresh_task_list();
        return true;
    }

    /*渲染所有task*/
    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_items = [];
        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete) {
                complete_items[i] = item;
            } else {
                var $task = render_task_item(item, i);
            }
            $task_list.prepend($task);
        }

        for (var j = 0; j < complete_items.length; j++) {
            $task = render_task_item(complete_items[j], j);

            if (!$task) {
                continue;
            }
            $task.addClass('completed');
            $task_list.append($task);
        }

        $delete_task_trigger = $('.action.delete');
        $detail_task_trigger = $('.action.detail');
        $checkbox_complete = $('.task-item .complete');
        listen_task_delete();
        listen_task_detail();
        listen_checkbox_complete();
    }

    /*渲染单条task模板*/
    function render_task_item(data, index) {
        if (!data || !index) {
            return;
        }
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input class="complete" ' + (data.complete ? 'checked' : '') + ' type="checkbox" name=""></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete">删除</span>' +
            '<span class="action detail">详情</span>' +
            '</span>' +
            '</div>';

        return $(list_item_tpl);
    }

    /**
     * 刷新localStorage数据并重新渲染模板
     */
    function refresh_task_list() {
        /*更新localStorage*/
        store.set('task_list', task_list);

        render_task_list();
    }

    /*删除一条task*/
    function delete_task(index) {
        /*如果没有index或者index不存在，直接返回*/
        if (index === undefined || !task_list[index]) {
            return;
        }

        delete task_list[index];
        refresh_task_list();
    }
})();