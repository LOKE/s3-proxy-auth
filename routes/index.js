var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var DEFAULT_OBJECT = 'index.html';

var buckets = require('../buckets.json');

router.get('/', function (req, res) {
  var bucketName = buckets.default;
  proxyRequest(bucketName, DEFAULT_OBJECT, req, res);
});

/* GET home page. */
router.get(/^\/([^\/]*)\/(.+)/, function (req, res) {
  var bucketName = req.params[0];
  var objectName = req.params[1];
  proxyRequest(bucketName, objectName, req, res);
});

router.get('/:bucket', function (req, res) {
  var bucketName = req.params.bucket;
  proxyRequest(bucketName, DEFAULT_OBJECT, req, res);
});

function proxyRequest(bucketName, objectName, req, res) {
  var bucket = buckets[bucketName];
  objectName = objectName || DEFAULT_OBJECT;

  AWS.config.update({accessKeyId: req.user.s3key, secretAccessKey: req.user.s3secret, region: bucket.region});
  var s3 = new AWS.S3();
  var request = s3.getObject({Bucket: bucket.name, Key: objectName});
  var piped = false;

  request.createReadStream()
  /**
   * 'readable' can fire more than once but we only want to pipe the
   * response once so use a simple semaphore
   */
    .on('readable', function () {
      if (!piped) {
        piped = true;
        console.log("stream from AWS is readable, sending to response");
        this.pipe(res);
      }
    }).on('end', function () {
      console.log("stream from AWS ended");
      res.end();
    }).on('error', function (error) {
      res.end('There was an Error: ' + (error.toString()));
    });

}

module.exports = router;
