'use strict';

import Vue from 'vue';
import url from './urls';
import {Store} from '../store';
import Crypt from 'jssha';

const http = Vue.http;
const resource = Vue.resource;

// todo: encrypt 
const apiUser = {
    login(userName, password) {
        return new Promise((resolve, reject) => {
            const time = Date.now();
            const hmac = new Crypt('SHA-512', 'TEXT');
            hmac.setHMACKey(password, 'TEXT');
            hmac.update(userName + "#" + time);
            const sign = hmac.getHMAC('HEX');

            http.post(url.account.login, {
                'time_stamp': time,
                'user_name': userName,
                sign
            }).then((response) => {
                let json = response.body;
                if (json && json.code == 0 && json.content) {
                    Store.commit({
                        type: 'signIn',
                        data: json.content
                    });
                    resolve(json.content);
                } else {
                    console.log('post '+ url.account.login + ' fail, call reject');
                    reject(response);
                }
            }, (error) => {
                reject(error);
            });
        });
    }
};

const apiPost = {
    api: resource('http://localhost:3000/articles', {}, {
        post: {
            method: 'POST'
        }
    }),

    fetchAll(param) {
       
    },

    fetch(page, size) {
        return new Promise((resolve, reject) => {
            http.get(url.post).then(response => {
                resolve(response.json());
            }, error => {
                reject(error);
            });
        });
    },

    save(body) {
        console.log('save');
        const self = this;
        body.author = Store.state.user.uid;

        return new Promise((resolve, reject) => {
            self.api.post({id: body.id}, body).then(response => {
                console.log('response: ' + JSON.stringify(response));

                const json = response.json();

                if (json && json.code == 0) {
                    resolve(json);
                } else {
                    reject(response);
                }

            }, reject);
        });
    },

    fetchDetail(id) {
        return new Promise((resolve, reject) => {
            http.get(url.post + '/' + id).then(response => {
                let json = response.json();
                resolve(json);
            }, reject);
        });
    }
};


export default {
    user: apiUser,
    post: apiPost
}
