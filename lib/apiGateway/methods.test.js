'use strict'

const chai = require('chai')
const Serverless = require('serverless/lib/Serverless')
const AwsProvider = require('serverless/lib/plugins/aws/provider/awsProvider')
const ServerlessApigatewayServiceProxy = require('./../index')

chai.use(require('chai-as-promised'))
const expect = require('chai').expect

describe('#getAllServiceProxies()', () => {
  let serverless
  let serverlessApigatewayServiceProxy

  beforeEach(() => {
    serverless = new Serverless()
    serverless.servicePath = true
    serverless.service.service = 'apigw-service-proxy'
    const options = {
      stage: 'dev',
      region: 'us-east-1'
    }
    serverless.setProvider('aws', new AwsProvider(serverless))
    serverlessApigatewayServiceProxy = new ServerlessApigatewayServiceProxy(serverless, options)
  })

  describe('#getMethodResponses()', () => {
    it('should return a corresponding methodResponses resource', async () => {
      await expect(
        serverlessApigatewayServiceProxy.getMethodResponses()
      ).to.eventually.have.nested.property('Properties.MethodResponses')
    })

    it('should set Access-Control-Allow-Origin header when cors is true', async () => {
      await expect(
        serverlessApigatewayServiceProxy.getMethodResponses({
          cors: {
            origin: '*'
          }
        })
      ).to.be.fulfilled.then((json) => {
        expect(
          json.Properties.MethodResponses[0].ResponseParameters[
            'method.response.header.Access-Control-Allow-Origin'
          ]
        ).to.equal("'*'")
      })

      await expect(
        serverlessApigatewayServiceProxy.getMethodResponses({
          cors: {
            origins: ['*', 'http://example.com']
          }
        })
      ).to.be.fulfilled.then((json) => {
        expect(
          json.Properties.MethodResponses[0].ResponseParameters[
            'method.response.header.Access-Control-Allow-Origin'
          ]
        ).to.equal("'*,http://example.com'")
      })
    })
  })
})