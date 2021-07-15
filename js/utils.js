//当前app挂在window上
var app = app || {};

(function () {
    'use strict';

    app.Utils = {
        senReq: function (url, data, method = "post") {
            const HOST="http://localhost:3002"
            return new Promise(resolve => {
                let request = new Request(HOST+url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body:data?JSON.stringify(data):null
                })
                //返回promise 对象
                fetch(request).then(response => response.json()).then(data => {
                    console.log(data)
                    resolve(data);
                },function (e){
                    alert("请求错误："+e);
                    return null;
                })
            })

        },
        pluralize: function (count, word) {
            return count === 1 ? word : word + 's';
        },

        store: function (namespace, data) {
            if (data) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            }

            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store)) || [];
        },

        extend: function () {
            var newObj = {};
            for (var i = 0; i < arguments.length; i++) {
                var obj = arguments[i];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        newObj[key] = obj[key];
                    }
                }
            }
            return newObj;
        }
    };
})();
