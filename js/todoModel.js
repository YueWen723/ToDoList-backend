/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
const app = app || {};

(function () {
    'use strict';

    const Utils = app.Utils;
    // Generic "model" object. You can use whatever
    // framework you want. For this application it
    // may not even be worth separating this logic
    // out, but we do this to demonstrate one way to
    // separate out parts of your application.
    app.TodoModel = function (key) {
        this.key = key;
        //需要初始化值
        this.todos = [];
        this.onChanges = [];
        this.initData()
    };
    /**
     * 初始化数据
     * @returns {Promise<void>}
     */
    app.TodoModel.prototype.initData = async function () {
        let res = await Utils.senReq("/api/todo/list", null, 'get');
        if (res.code == 200) {
            this.todos = res.data
        }
        this.inform()
    }
    app.TodoModel.prototype.subscribe = function (onChange) {
        this.onChanges.push(onChange);
    };

    app.TodoModel.prototype.inform = function () {
        Utils.store(this.key, this.todos);
        //这里是重新渲染列表的意思
        this.onChanges.forEach(function (cb) {
            cb();
        });
    };

    app.TodoModel.prototype.addTodo = async function (name) {
        let todo = {
            name: name,
            completed: false,
            status: "active"
        }
        //发请求保存数据
        let res = await Utils.senReq("/api/todo/insert", todo);
        if (res.code == 200) {
            todo = res.data
        }
        this.todos = this.todos.concat(todo);
        this.inform();
    };

    app.TodoModel.prototype.toggleAll = function (checked) {
        // Note: it's usually better to use immutable data structures since they're
        // easier to reason about and React works very well with them. That's why
        // we use map() and filter() everywhere instead of mutating the array or
        // todo items themselves.
        this.todos = this.todos.map(function (todo) {
            return Utils.extend({}, todo, {completed: checked});
        });
        //更新数据
        for (let i = 0; i < this.todos.length; i++) {
            let tdo = this.todos[i];
            Utils.senReq("/api/todo/update", tdo);
        }
        this.inform();
    };


    app.TodoModel.prototype.toggle = function (todoToToggle) {
        let toUpdate = [];
        this.todos = this.todos.map(function (todo) {
            if(todoToToggle===todo){
                console.log(todo)
                let tmpDto={...todoToToggle};
                tmpDto['completed']=!tmpDto['completed']
                toUpdate.push(tmpDto)
            }
            return todo !== todoToToggle ?
                todo :
                Utils.extend({}, todo, {completed: !todo.completed});
        });
        //更新数据
        for (let i = 0; i < toUpdate.length; i++) {
            let tdo = toUpdate[i];
            Utils.senReq("/api/todo/update", tdo);
        }

        this.inform();
    };

    app.TodoModel.prototype.destroy = function (todo) {
        let toDelete = [];
        this.todos = this.todos.filter(function (candidate) {
            if (candidate === todo) {
                toDelete.push(todo)
            }
            return candidate !== todo;
        });
        //删除数据
        for (let i = 0; i < toDelete.length; i++) {
            let tdo = toDelete[i];
            Utils.senReq("/api/todo/delete", tdo);
        }
        this.inform();
    };

    app.TodoModel.prototype.save =async function (todoToSave, text) {
        let toUpdate = [];
        this.todos = this.todos.map(function (todo) {
            if (todo === todoToSave) {
                toUpdate.push(todoToSave)
            }
            return todo !== todoToSave ? todo : Utils.extend({}, todo, {name: text});
        });
        console.log(toUpdate)
        //更新数据
        for (let i = 0; i < toUpdate.length; i++) {
            let tdo = toUpdate[i];
            await Utils.senReq("/api/todo/update", tdo);
        }
        this.inform();
    };

    app.TodoModel.prototype.clearCompleted = function () {
        let toDelete = [];
        this.todos = this.todos.filter(function (todo) {
            if(todo.completed){
                toDelete.push(todo)
            }
            return !todo.completed;
        });
        //删除数据
        for (let i = 0; i < toDelete.length; i++) {
            let tdo = toDelete[i];
            Utils.senReq("/api/todo/delete", tdo);
        }
        this.inform();
    };

})();
