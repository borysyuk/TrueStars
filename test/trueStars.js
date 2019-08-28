const TrueStars = artifacts.require("./TrueStars.sol");
const exceptions = require("./helpers/expectThrow");
const events = require("./helpers/expectEvent");
const TrueStarsABI = require("../client/src/contracts/TrueStars.json").abi;

const BN = web3.utils.BN;

const NULL = 0;
const COMMIT = 1;
const REVEAL = 2;
const WITHDRAW = 3;
const DESTROY = 4;

contract("TrueStars", function ([_, admin1, admin2, admin3, owner]) {

    function shouldMatchEntity(expected, actual){
        assert.equal(expected[0], actual[0]);
        assert.equal(expected[1], actual[1]);
        assert.equal(expected[2], actual[2]);
        assert.equal(expected[3], actual[3]);
    }

    beforeEach(async function (){
        this.contract = await TrueStars.new({ from: owner });
    });

    context('general', async function (){
        it('should exists', async function (){
        });
    });

    context('Test admins', async function (){

        context('add market', async function (){
            let stake = web3.utils.toWei('100', 'gwei');
            let exId = 1;
            let maxRate = 100;

            it('should add market', async function (){
                let tx = await this.contract.createMarket(exId, maxRate, {value: stake, from: owner });
                let id = await this.contract.computeId.call(exId, owner);
                let market = await this.contract.getMarket.call(id);

                assert.equal(market.data[1], maxRate);
                assert.equal(market.data[4], stake);
                assert.equal(market.data[5], COMMIT);

                assert.equal(market.owner, owner);
            });

            it('should raise exception when market is already exists', async function (){
                let tx = await this.contract.createMarket(exId, maxRate, { from: owner });
                await exceptions.expectThrow(
                    this.contract.createMarket(exId, maxRate, { from: owner }),
                    exceptions.errTypes.revert,
                    "Already exists"
                );
            });

            it('should raise exception when rate is too big', async function (){
                await exceptions.expectThrow(
                    this.contract.createMarket(exId, maxRate + 100, { from: owner }),
                    exceptions.errTypes.revert,
                    "Max rating is too big"
                );
            })

            it('should emit Add admin event', async function (){
                let id = await this.contract.computeId.call(exId, owner);
                await events.inTransaction(
                    this.contract.createMarket(exId, maxRate, { from: owner }),
                    'MarketCreated',
                    {
                        marketCode: new BN(exId),
                        marketId: id,
                        owner: owner
                    }
                );
            });
        });
    });
});
