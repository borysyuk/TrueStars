const TrueStars = artifacts.require("./TrueStars.sol");
const exceptions = require("./helpers/expectThrow");
const events = require("./helpers/expectEvent");
const helpers = require("./helpers/common");
const TrueStarsABI = require("../client/src/contracts/TrueStars.json").abi;

const BN = web3.utils.BN;

const NULL = 0;
const COMMIT = 1;
const REVEAL = 2;
const WITHDRAW = 3;
const DESTROYED = 4;

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

    //     context('createMarket', async function (){
    //         let stake = web3.utils.toWei('100', 'gwei');
    //         let exId = 1;
    //         let maxRate = 100;
    //
    //
    //         it('should add market without stake', async function (){
    //             let tx = await this.contract.createMarket(exId, maxRate, {from: owner });
    //             let id = await this.contract.computeId.call(exId, owner);
    //             let market = await this.contract.getMarket.call(id);
    //
    //             assert.equal(market.data[1], maxRate);
    //             assert.equal(market.data[4], 0);
    //             assert.equal(market.data[5], COMMIT);
    //
    //             assert.equal(market.owner, owner);
    //         });
    //
    //         it('should add market', async function (){
    //             let tx = await this.contract.createMarket(exId, maxRate, {value: stake, from: owner });
    //             let id = await this.contract.computeId.call(exId, owner);
    //             let market = await this.contract.getMarket.call(id);
    //
    //             assert.equal(market.data[1], maxRate);
    //             assert.equal(market.data[4], stake);
    //             assert.equal(market.data[5], COMMIT);
    //
    //             assert.equal(market.owner, owner);
    //         });
    //
    //         it('should raise exception when market is already exists', async function (){
    //             let tx = await this.contract.createMarket(exId, maxRate, { from: owner });
    //             await exceptions.expectThrow(
    //                 this.contract.createMarket(exId, maxRate, { from: owner }),
    //                 exceptions.errTypes.revert,
    //                 "Already exists"
    //             );
    //         });
    //
    //         it('should raise exception when rate is too big', async function (){
    //             await exceptions.expectThrow(
    //                 this.contract.createMarket(exId, maxRate + 100, { from: owner }),
    //                 exceptions.errTypes.revert,
    //                 "Max rating is too big"
    //             );
    //         })
    //
    //         it('should emit Add admin event', async function (){
    //             let id = await this.contract.computeId.call(exId, owner);
    //             await events.inTransaction(
    //                 this.contract.createMarket(exId, maxRate, { from: owner }),
    //                 'MarketCreated',
    //                 {
    //                     marketCode: new BN(exId),
    //                     marketId: id,
    //                     owner: owner
    //                 }
    //             );
    //         });
    //     });
    //
    //     context('startReveal', async function (){
    //         let code = 1;
    //         let maxRate = 100;
    //         let id;
    //
    //         before(async function (){
    //             id = await this.contract.computeId.call(code, owner);
    //         });
    //
    //         beforeEach(async function (){
    //             let tx = await this.contract.createMarket(code, maxRate, {from: owner });
    //         });
    //
    //         it('should switch phase to reveal', async function (){
    //             let market = await this.contract.getMarket.call(id);
    //             assert.equal(market.data[5], COMMIT);
    //
    //             let tx = await this.contract.startReveal(id, { from: owner });
    //
    //             market = await this.contract.getMarket.call(id);
    //             assert.equal(market.data[5], REVEAL);
    //         });
    //
    //         it('should raise exception when not owner', async function (){
    //             await exceptions.expectThrow(
    //                 this.contract.startReveal(id, { from: admin1 }),
    //                 exceptions.errTypes.revert,
    //                 "You are not a market owner"
    //             );
    //         })
    //
    //         it('should raise exception when phase is not COMMIT', async function (){
    //             let tx = await this.contract.startReveal(id, { from: owner });
    //             await exceptions.expectThrow(
    //                 this.contract.startReveal(id, { from: owner }),
    //                 exceptions.errTypes.revert,
    //                 "Commit phase expected"
    //             );
    //         })
    //
    //         it('should emit RevealPhase', async function (){
    //             await events.inTransaction(
    //                 this.contract.startReveal(id, { from: owner }),
    //                 'RevealPhase',
    //                 {
    //                     marketId: id,
    //                     owner: owner
    //                 }
    //             );
    //         });
    //     })

        context('destroyMarket', async function (){
            let code = 1;
            let maxRate = 100;
            let id;
            let stake = web3.utils.toWei('1', 'ether');

            before(async function (){
                id = await this.contract.computeId.call(code, owner);
            });

            beforeEach(async function (){
                //TODO add players, add commits, reveals to have not 0 totalWithdraw
                let tx = await this.contract.createMarket(
                    code,
                    maxRate,
                    {
                        from: owner,
                        value: stake
                    }
                );
                tx = await this.contract.startReveal(id, { from: owner });
                tx = await this.contract.startWithdraw(id, { from: owner });
            });

            it('should switch phase to DESTROY', async function (){
                let market = await this.contract.getMarket.call(id);
                assert.equal(market.data[5], WITHDRAW);

                let tx = await this.contract.destroyMarket(id, { from: owner });

                market = await this.contract.getMarket.call(id);
                assert.equal(market.data[5], DESTROYED);
            });

            it('should transfer money to owner', async function (){
                let marketBefore = await this.contract.getMarket.call(id);
                assert.equal(marketBefore.data[4], stake);

                let oldOwnersBalance = await web3.eth.getBalance(owner);
                let oldContractBalance = await web3.eth.getBalance(this.contract.address);
                let expectedWithdraw = marketBefore.data[4].sub(marketBefore.data[8]);

                let tx = await this.contract.destroyMarket(id, { from: owner });
                let txInfo = await web3.eth.getTransaction(tx.tx);

                let newOwnersBalance = await web3.eth.getBalance(owner);
                let newContractBalance = await web3.eth.getBalance(this.contract.address);
                //check contract balance
                assert.equal(newContractBalance, oldContractBalance - expectedWithdraw);
                //check market owner's balance
                assert.equal(
                    newOwnersBalance,
                    new BN(oldOwnersBalance)
                    .add(new BN(expectedWithdraw))
                    .sub(new BN(tx.receipt.gasUsed*txInfo.gasPrice))
                    .toString()
                );
            });

            it('should raise exception when not owner', async function (){
                await exceptions.expectThrow(
                    this.contract.destroyMarket(id, { from: admin1 }),
                    exceptions.errTypes.revert,
                    "You are not a market owner"
                );
            })

            it('should raise exception when phase is not WITHDRAW', async function (){
                let tx = await this.contract.destroyMarket(id, { from: owner });
                await exceptions.expectThrow(
                    this.contract.destroyMarket(id, { from: owner }),
                    exceptions.errTypes.revert,
                    "Withdraw phase expected"
                );
            })

            it('should emit MarketDestroyed', async function (){
                await events.inTransaction(
                    this.contract.destroyMarket(id, { from: owner }),
                    'MarketDestroyed',
                    {
                        marketId: id,
                        owner: owner
                    }
                );
            });
        })
    });

    // context('Test general functions', async function (){
    //
    //     context('compute ID', async function (){
    //         it('should compute id', async function (){
    //             let code = '0x1';
    //             let id = await this.contract.computeId.call(code, owner);
    //             let expected = web3.utils.keccak256(
    //                 Buffer.concat([
    //                     helpers.hexToBuffer(code, 32),
    //                     helpers.hexToBuffer(owner, 20)
    //                 ])
    //             );
    //             assert.equal(id, expected);
    //         });
    //     });
    //
    //     context('compute commitment', async function (){
    //         it('should commitment', async function (){
    //             let rate = '0x18';
    //             let rand = web3.utils.randomHex(32);
    //
    //             let commitment = await this.contract.computeCommitment.call(rate, rand);
    //             let expected = web3.utils.keccak256(
    //                 Buffer.concat([
    //                     helpers.hexToBuffer(rate, 32),
    //                     helpers.hexToBuffer(rand, 32)
    //                 ])
    //             );
    //             assert.equal(commitment, expected);
    //         });
    //     });
    //
    // });

});
