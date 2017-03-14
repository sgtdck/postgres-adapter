require('jugglingdb/test/common.batch.js');
require('jugglingdb/test/include.test.js');
var Schema = require('jugglingdb').Schema;
var assert = require('assert');
var schema = getSchema();
var Post;
var Article;

it('should not generate malformed SQL for number columns set to empty string', function (done) {
    Post = schema.define('posts', {
        title: { type: String }
        , userId: { type: Number }
    });
    schema.autoupdate(function() {
        var post = new Post({title:'no userId', userId:''});

        Post.destroyAll(function () {
            post.save(function (err, post) {
                var id = post.id
                Post.all({where:{title:'no userId'}}, function (err, post) {
                    assert.ok(!err);
                    assert.ok(post[0].id == id);
                    done();
                });
            });
        });
    });
});

it('all should support regex', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'Postgres Test Title'}, function (err, post) {
            var id = post.id
            Post.all({where:{title:/^Postgres/}}, function (err, post) {
                assert.ok(!err);
                assert.ok(post[0].id == id);
                done();
            });
        });
    });
});

it('all should support arbitrary expressions', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'Postgres Test Title'}, function (err, post) {
            var id = post.id
            Post.all({where:{title:{ilike:'postgres%'}}}, function (err, post) {
                assert.ok(!err);
                assert.ok(post[0].id == id);
                done();
            });
        });
    });
})

it('all should support like operator', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'Postgres Test Title'}, function (err, post) {
            var id = post.id
            Post.all({where:{title:{like:'%Test%'}}}, function (err, post) {
                assert.ok(!err);
                assert.ok(post[0].id == id);
                done();
            });
        });
    });
});

it('all should support \'not like\' operator ', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'Postgres Test Title'}, function (err, post) {
            var id = post.id
            Post.all({where:{title:{nlike:'%Test%'}}}, function (err, post) {
                assert.ok(!err);
                assert.ok(post.length===0);
                done();
            });
        });
    });
});

it('all should support arbitrary where clauses', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'Postgres Test Title'}, function (err, post) {
            var id = post.id;
            Post.all({where:{arbitrary:"title = 'Postgres Test Title'"}}, function (err, post) {
                assert.ok(!err);
                assert.ok(post[0].id == id);
                done();
            });
        });
    });
});

it('all should support arbitrary parameterized where clauses', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'Postgres Test Title'}, function (err, post) {
            var id = post.id;
            Post.all({where:['title = ?', 'Postgres Test Title']}, function (err, post) {
                assert.ok(!err);
                assert.ok(post[0].id == id);
                done();
            });
        });
    });
});

it('all should support \'not equal\' operator for NULL values', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'Postgres Test Title'}, function (err, post) {
            var id = post.id
            Post.all({where:{title:{neq:null}}}, function (err, post) {
                assert.ok(!err);
                assert.ok(post[0].id == id);
                done();
            });
        });
    });
});

it('all should support \'or\' operator', function (done) {
    Post.destroyAll(function () {
        Post.create({title:'First Title',userId:1}, function (err, post1) {
            Post.create({title:'Second Title',userId:2}, function (err, post2) {
                Post.create({title:'Third Title',userId:3}, function (err, post2) {
                    var where = {
                        or: [{
                            title: 'First Title',
                            userId: 1
                        },{
                            title: 'Second Title',
                            userId: 2
                        }]
                    };
                    Post.all({where: where}, function (err, posts) {
                        assert.ok(!err);
                        assert.ok(posts.length === 2);
                        done();
                    });
                });
            });
        });
    });
});

it('should support \'jsonb\' dataType for type \'JSON\'', function (done) {
    Article = schema.define('articles', {
        title: { type: String }
        , userId: { type: Number }
        , body: { type: Schema.JSON, dataType: 'jsonb'}
    });
    schema.autoupdate(function () {
        Article.destroyAll(function () {
            Article.create([
                {title:'Article 1', userId:'', body: '{"article":{"tags":["foo","bar","baz"]}}'}
                , {title:'Article 2', userId:'', body: '{"article":{"tags":["bar","baz"]}}'}
                , {title:'Article 3', userId:'', body: '{"article":{"tags":["baz"]}}'}
            ], function (err, articles) {
                var article1 = articles[0];

                Article.all({where:{arbitrary:"(body#>>'{article,tags}')::jsonb ?& array['foo']"}}, function (err, articles) {
                    assert.ok(!err);
                    assert.ok(article1.id == articles[0].id);
                    assert.equal(articles.length, 1, "only one article matches");
                    done();
                });
            });
        });
    });
});

