const TrueStars = artifacts.require("./TrueStars.sol");
const exceptions = require("./helpers/expectThrow");
const events = require("./helpers/expectEvent");
const TrueStarsABI = require("../client/src/contracts/TrueStars.json").abi;

const BN = web3.utils.BN;

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
            it('should add market', async function (){
                let tx = await this.contract.createMarket(1, 100, { from: owner });
                let result = await this.contract.getMarket.call(tx.logs[0].args.marketId);
                let id = await this.contract.computeId.call(1, owner);
            });

            it('should raise exception when market is already exists', async function (){
                let tx = await this.contract.createMarket(1, 100, { from: owner });
                await exceptions.expectThrow(
                    this.contract.createMarket(1, 100, { from: owner }),
                    exceptions.errTypes.revert,
                    ""
                );
            });

            it('should raise exception when rate is too big', async function (){
                await exceptions.expectThrow(
                    this.contract.createMarket(1, 200, { from: owner }),
                    exceptions.errTypes.revert,
                    ""
                );
            })

            it('should emit Add admin event', async function (){
                await events.inTransaction(
                    this.contract.createMarket(1, 100, { from: owner }),
                    'MarketCreated',
                    {
                        externalId: new BN(1),
                        owner: owner
                    }
                );
            });
        });
    });
});
