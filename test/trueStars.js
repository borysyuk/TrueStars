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
const MAX_RATE = 100;

contract("TrueStars", function([
    _,
    admin1,
    admin2,
    admin3,
    owner,
    player,
    player1,
    player2,
    player3,
    playerZero,
]) {

    async function registerPlayers(contract, id, players, owner) {
        for (i=0; i<players.length;i++) {
            tx = await contract.registerPlayer(
                id,
                players[i].address,
                players[i].weight,
                {from: owner}
            );
        }
    }

    async function postCommits(contract, id, players) {
        for (i=0; i<players.length;i++) {
            tx = await contract.commit(
                id,
                players[i].data.commitment,
                {from: players[i].address}
            );
        }
    }

    async function revealRates(contract, id, players) {
        for (i=0; i<players.length;i++) {
            tx = await contract.reveal(
                id,
                players[i].rate,
                players[i].data.rand,
                {from: players[i].address}
            );
        }
    }

    function computeRate(players) {
        let rate = 0, totalWeight = 0, totalRate = 0;
        let distance = 0;
        let weights = {};
        for (i=0; i<players.length;i++) {
            totalRate += players[i].rate * players[i].weight;
            totalWeight += players[i].weight;
            weights[players[i].rate] = weights[players[i].rate] || 0;
            weights[players[i].rate] = weights[players[i].rate] + players[i].weight;
        }
        rate = Math.round(totalRate/totalWeight);

        for (i=0; i<100;i++) {
            if (weights[rate+i]>0 || weights[rate-i]>0) {
                distance = i;
                break;
            }
        }

        return {
            rate: rate,
            distance: distance,
            totalWinWeight: (weights[rate+distance] || 0) + (weights[rate-distance] || 0)
        }
    }

    let players = [
        {
            address: player,
            rate: 8,
            weight: 5,
            data: helpers.generateCommitment(8)
        }
    ]
    let winners = [
        {
            address: player1,
            rate: 50,
            weight: 6,
            data: helpers.generateCommitment(50)
        },
        {
            address: player2,
            rate: 50,
            weight: 8,
            data: helpers.generateCommitment(50)
        },
    ]

    beforeEach(async function() {
        this.contract = await TrueStars.new({from: owner});
    });

    context('general', async function() {
        it('should exists', async function() {});
    });

    context('Test owner functions', async function() {

        context('createMarket', async function() {
            let stake = web3.utils.toWei('100', 'gwei');
            let exId = 1;
            let MAX_RATE = 100;

            it('should add market without stake', async function() {
                let tx = await this.contract.createMarket(exId, MAX_RATE, {from: owner});
                let id = await this.contract.computeId.call(exId, owner);
                let market = await this.contract.getMarket.call(id);

                assert.equal(market.data[1], MAX_RATE);
                assert.equal(market.data[4], 0);
                assert.equal(market.data[5], COMMIT);

                assert.equal(market.owner, owner);
            });

            it('should add market', async function() {
                let tx = await this.contract.createMarket(exId, MAX_RATE, {
                    value: stake,
                    from: owner
                });
                let id = await this.contract.computeId.call(exId, owner);
                let market = await this.contract.getMarket.call(id);

                assert.equal(market.data[1], MAX_RATE);
                assert.equal(market.data[4], stake);
                assert.equal(market.data[5], COMMIT);

                assert.equal(market.owner, owner);
            });

            it('should raise exception when market is already exists', async function() {
                let tx = await this.contract.createMarket(exId, MAX_RATE, {from: owner});
                await exceptions.expectThrow(
                    this.contract.createMarket(exId, MAX_RATE, {from: owner}),
                    exceptions.errTypes.revert,
                    "Already exists"
                );
            });

            it('should raise exception when rate is too big', async function() {
                await exceptions.expectThrow(
                    this.contract.createMarket(exId, MAX_RATE + 100, {from: owner}),
                    exceptions.errTypes.revert,
                    "Max rating is too big"
                );
            })

            it('should emit Add admin event', async function() {
                let id = await this.contract.computeId.call(exId, owner);
                await events.inTransaction(
                    this.contract.createMarket(exId, MAX_RATE, {from: owner}),
                    'MarketCreated',
                    {
                        marketCode: new BN(exId),
                        marketId: id,
                        owner: owner
                    }
                );
            });
        });

        context('startReveal', async function() {
            let code = 1;
            let MAX_RATE = 100;
            let id;

            before(async function() {
                id = await this.contract.computeId.call(code, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(code, MAX_RATE, {from: owner});
            });

            it('should switch phase to reveal', async function() {
                let market = await this.contract.getMarket.call(id);
                assert.equal(market.data[5], COMMIT);

                let tx = await this.contract.startReveal(id, {from: owner});

                market = await this.contract.getMarket.call(id);
                assert.equal(market.data[5], REVEAL);
            });

            it('should raise exception when not owner', async function() {
                await exceptions.expectThrow(
                    this.contract.startReveal(id, {from: admin1}),
                    exceptions.errTypes.revert,
                    "You are not a market owner"
                );
            })

            it('should raise exception when phase is not COMMIT', async function() {
                let tx = await this.contract.startReveal(id, {from: owner});
                await exceptions.expectThrow(
                    this.contract.startReveal(id, {from: owner}),
                    exceptions.errTypes.revert,
                    "Commit phase expected"
                );
            })

            it('should emit RevealPhase', async function() {
                await events.inTransaction(
                    this.contract.startReveal(id, {from: owner}),
                    'RevealPhase',
                    {
                        marketId: id,
                        owner: owner
                    }
                );
            });
        })

        context('startWithdraw', async function() {
            let code = 1;
            let MAX_RATE = 100;
            let id;
            let stake = web3.utils.toWei('1', 'gwei');

            before(async function() {
                id = await this.contract.computeId.call(code, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(
                    code,
                    MAX_RATE,
                    {from: owner, value: stake}
                );
            });

            it('should raise exception when not owner', async function() {
                await exceptions.expectThrow(
                    this.contract.startWithdraw(id, {from: admin1}),
                    exceptions.errTypes.revert,
                    "You are not a market owner"
                );
            })

            it('should raise exception when phase is not Reveal', async function() {
                await exceptions.expectThrow(
                    this.contract.startWithdraw(id, {from: owner}),
                    exceptions.errTypes.revert,
                    "Reveal phase expected"
                );
            })

            context('rates were added and rating is not ZERO', async function() {

                beforeEach(async function() {
                    await registerPlayers(this.contract, id, players.concat(winners), owner);
                    await postCommits(this.contract, id, players.concat(winners));
                    tx = await this.contract.startReveal(id, {from: owner});
                    await revealRates(this.contract, id, players.concat(winners));
                });

                it('should switch phase to withdraw', async function() {
                    let market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[5], REVEAL);

                    let tx = await this.contract.startWithdraw(id, {from: owner});

                    market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[5], WITHDRAW);
                });

                it('should set correct totalWinWeight', async function() {
                    let rateInfo = computeRate(players.concat(winners));
                    let market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[9], 0);

                    let tx = await this.contract.startWithdraw(id, {from: owner});

                    market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[9], rateInfo.totalWinWeight);
                })

                it('should emit WithdrawPhase', async function() {
                    let rateInfo = computeRate(players.concat(winners));
                    await events.inTransaction(
                        this.contract.startWithdraw(id, {from: owner}),
                        'WithdrawPhase',
                        {
                            marketId: id,
                            winningRating: new BN(rateInfo.rate),
                            winDistance: new BN(rateInfo.distance),
                            totalPrize: stake,
                            owner: owner
                        }
                    );
                });
            });

            context('none of players commited rates', async function() {

                beforeEach(async function() {
                    tx = await this.contract.startReveal(id, {from: owner});
                });

                it('should switch phase to withdraw', async function() {
                    let market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[5], REVEAL);

                    let tx = await this.contract.startWithdraw(id, {from: owner});

                    market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[5], WITHDRAW);
                });

                it('should set correct totalWinWeight', async function() {
                    let market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[9], 0);

                    let tx = await this.contract.startWithdraw(id, {from: owner});

                    market = await this.contract.getMarket.call(id);
                    assert.equal(market.data[9], 0);
                });

                it('should emit WithdrawPhase', async function() {
                    let rateInfo = computeRate(players.concat(winners));
                    await events.inTransaction(
                        this.contract.startWithdraw(id, {from: owner}),
                        'WithdrawPhase',
                        {
                            marketId: id,
                            winningRating: '0',
                            winDistance: '0',
                            totalPrize: stake,
                            owner: owner
                        }
                    );
                });
            });

        })


        context('destroyMarket', async function() {
            let code = 1;
            let MAX_RATE = 100;
            let id;
            let stake = web3.utils.toWei('1', 'gwei');

            before(async function() {
                id = await this.contract.computeId.call(code, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(code, MAX_RATE, {
                    from: owner,
                    value: stake
                });
                await registerPlayers(this.contract, id, players.concat(winners), owner);
                await postCommits(this.contract, id, players.concat(winners));
                tx = await this.contract.startReveal(id, {from: owner});
                await revealRates(this.contract, id, players.concat(winners));
                tx = await this.contract.startWithdraw(id, {from: owner});
                tx = await this.contract.withdraw(id, {from: winners[0].address});
            });

            it('should switch phase to DESTROY', async function() {
                let market = await this.contract.getMarket.call(id);
                assert.equal(market.data[5], WITHDRAW);

                let tx = await this.contract.destroyMarket(id, {from: owner});

                market = await this.contract.getMarket.call(id);
                assert.equal(market.data[5], DESTROYED);
            });

            it('should transfer money to owner', async function() {
                let marketBefore = await this.contract.getMarket.call(id);
                assert.equal(marketBefore.data[4], stake);

                let oldOwnersBalance = await web3.eth.getBalance(owner);
                let oldContractBalance = await web3.eth.getBalance(this.contract.address);
                let expectedWithdraw = marketBefore.data[4].sub(marketBefore.data[8]);

                let tx = await this.contract.destroyMarket(id, {from: owner});
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
                        .sub(new BN(tx.receipt.gasUsed * txInfo.gasPrice))
                        .toString()
                );
            });

            it('should raise exception when not owner', async function() {
                await exceptions.expectThrow(
                    this.contract.destroyMarket(id, {from: admin1}),
                    exceptions.errTypes.revert,
                    "You are not a market owner"
                );
            })

            it('should raise exception when phase is not WITHDRAW', async function() {
                let tx = await this.contract.destroyMarket(id, {from: owner});
                await exceptions.expectThrow(
                    this.contract.destroyMarket(id, {from: owner}),
                    exceptions.errTypes.revert,
                    "Withdraw phase expected"
                );
            })

            it('should emit MarketDestroyed', async function() {
                await events.inTransaction(
                    this.contract.destroyMarket(id, {from: owner}),
                    'MarketDestroyed', {
                        marketId: id,
                        owner: owner
                });
            });
        })


        context('fundMarket', async function() {
            let code = 1;
            let MAX_RATE = 100;
            let id;
            let stake = web3.utils.toWei('1', 'gwei');
            let extraStake = new BN(web3.utils.toWei('2', 'gwei'));
            let tx;

            before(async function() {
                id = await this.contract.computeId.call(code, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(code, MAX_RATE, {
                    from: owner,
                    value: stake
                });
            });

            it('should transfer money to contract and change stake', async function() {
                let marketBefore = await this.contract.getMarket.call(id);
                assert.equal(marketBefore.data[4], stake);

                let oldContractBalance = await web3.eth.getBalance(this.contract.address);
                tx = await this.contract.fundMarket(id, {
                    from: owner,
                    value: extraStake
                });

                let newContractBalance = await web3.eth.getBalance(this.contract.address);
                //check contract balance
                assert.equal(
                    newContractBalance,
                    new BN(oldContractBalance).add(extraStake).toString()
                );

                let marketAfter = await this.contract.getMarket.call(id);
                assert.equal(
                    marketAfter.data[4].toString(),
                    marketBefore.data[4].add(extraStake).toString()
                );
            });

            it('should raise exception when phase is WITHDRAW', async function() {
                tx = await this.contract.startReveal(id, {from: owner});
                tx = await this.contract.startWithdraw(id, {from: owner});
                await exceptions.expectThrow(this.contract.fundMarket(id, {
                    from: owner,
                    value: stake
                }), exceptions.errTypes.revert, "Commit or reveal phase expected");
            })
            it('should raise exception when phase is DESTORY', async function() {
                tx = await this.contract.startReveal(id, {from: owner});
                tx = await this.contract.startWithdraw(id, {from: owner});
                tx = await this.contract.destroyMarket(id, {from: owner});
                await exceptions.expectThrow(this.contract.fundMarket(id, {
                    from: owner,
                    value: stake
                }), exceptions.errTypes.revert, "Commit or reveal phase expected");
            })
        })

        context('registerPlayer', async function() {
            let code = 1;
            let MAX_RATE = 100;
            let id;
            let stake = web3.utils.toWei('1', 'gwei');
            let weight = 5;
            let tx;

            before(async function() {
                id = await this.contract.computeId.call(code, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(code, MAX_RATE, {
                    from: owner,
                    value: stake
                });
            });

            it('should register a new player and set weight', async function() {
                let playerBefore = await this.contract.getPlayer.call(id, player);
                assert.equal(playerBefore[0], 0);

                tx = await this.contract.registerPlayer(id, player, weight, {from: owner});

                let playerAfter = await this.contract.getPlayer.call(id, player);
                assert.equal(playerAfter[0], weight);
            });

            it('should update players weight', async function() {
                tx = await this.contract.registerPlayer(id, player, weight, {from: owner});
                let playerBefore = await this.contract.getPlayer.call(id, player);
                assert.equal(playerBefore[0], weight);

                tx = await this.contract.registerPlayer(id, player, weight + 2, {from: owner});

                let playerAfter = await this.contract.getPlayer.call(id, player);
                assert.equal(playerAfter[0], weight + 2);
            });

            it('should raise exception when not owner', async function() {
                await exceptions.expectThrow(
                    this.contract.registerPlayer(id, player, weight, {from: admin1}),
                    exceptions.errTypes.revert,
                    "You are not a market owner"
                );
            })

            it('should raise exception when phase is REVEAL', async function() {
                tx = await this.contract.startReveal(id, {from: owner});
                await exceptions.expectThrow(
                    this.contract.registerPlayer(id, player, weight, {from: owner}),
                    exceptions.errTypes.revert,
                    "Commit phase expected"
                );
            })

            it('should raise exception when phase is WITHDRAW', async function() {
                tx = await this.contract.startReveal(id, {from: owner});
                tx = await this.contract.startWithdraw(id, {from: owner});
                await exceptions.expectThrow(
                    this.contract.registerPlayer(id, player, weight, {from: owner}),
                    exceptions.errTypes.revert,
                    "Commit phase expected"
                );
            })
            it('should raise exception when phase is DESTORY', async function() {
                tx = await this.contract.startReveal(id, {from: owner});
                tx = await this.contract.startWithdraw(id, {from: owner});
                tx = await this.contract.destroyMarket(id, {from: owner});
                await exceptions.expectThrow(
                    this.contract.registerPlayer(id, player, weight, {from: owner}),
                    exceptions.errTypes.revert,
                    "Commit phase expected"
                );
            })
        })
    });

    context('Test player functions', async function() {

        let code = 1;
        let MAX_RATE = 100;
        let id;
        let stake = web3.utils.toWei('1', 'gwei');
        let tx;
        let player = players[0].address;

        before(async function() {
            id = await this.contract.computeId.call(code, owner);
        });

        beforeEach(async function() {
            let tx = await this.contract.createMarket(code, MAX_RATE, {
                from: owner,
                value: stake
            });
            registerPlayers(this.contract, id, players, owner);
        })

        context('add commitment', async function() {

            it('should upload a commitment to the contract', async function() {
                let data = helpers.generateCommitment(8);
                tx = await this.contract.commit(id, data.commitment, {from: player});
                let playerData = await this.contract.getPlayer.call(id, player);
                assert.equal(playerData[1], data.commitment);
            });

            it('should upload a second commitment to the contract', async function() {
                await postCommits(this.contract, id, players);

                data = helpers.generateCommitment(9);
                tx = await this.contract.commit(id, data.commitment, {from: player});

                let playerData = await this.contract.getPlayer.call(id, player);
                assert.equal(playerData[1], data.commitment);
            });

            it('should raise exception when phase is not COMMIT', async function() {
                tx = await this.contract.startReveal(id, {from: owner});
                await exceptions.expectThrow(
                    this.contract.commit(
                        id,
                        helpers.hexToBuffer(web3.utils.toHex("commitment"), 32),
                        {from: player}
                    ),
                    exceptions.errTypes.revert,
                    "Commit phase expected"
                );
            })
        });

        context('reveal commitment', async function() {
            let player = players[0].address
            beforeEach(async function() {
                await postCommits(this.contract, id, players);
            })

            it('should raise exception when phase is not REVEAL', async function() {
                await exceptions.expectThrow(
                    this.contract.reveal(
                        id,
                        players[0].rate,
                        players[0].data.rand,
                        {from: player}
                    ),
                    exceptions.errTypes.revert,
                    "Reveal phase expected"
                );
            })

            context('in reveal phase', async function() {
                beforeEach(async function() {
                    tx = await this.contract.startReveal(id, {from: owner});
                })

                it('should raise exception if rating < 1', async function() {
                    await exceptions.expectThrow(
                        this.contract.reveal(
                            id,
                            0,
                            players[0].data.rand,
                            {from: player}
                        ),
                        exceptions.errTypes.revert,
                        "Invalid rating"
                    );
                })

                it('should raise exception if rating > 100', async function() {
                    await exceptions.expectThrow(
                        this.contract.reveal(
                            id,
                            200,
                            players[0].data.rand,
                            {from: player}
                        ),
                        exceptions.errTypes.revert,
                        "Invalid rating"
                    );
                })

                it('should raise exception when reveal empty commitment', async function() {
                    await exceptions.expectThrow(
                        this.contract.reveal(
                            id,
                            players[0].rate,
                            players[0].data.rand,
                            {from: player1}
                        ),
                        exceptions.errTypes.revert,
                        "Invalid reveal"
                    );
                })

                it('should raise exception when commitment is invalid', async function() {
                    await exceptions.expectThrow(
                        this.contract.reveal(
                            id,
                            players[0].rate+1,
                            players[0].data.rand,
                            {from: player}
                        ),
                        exceptions.errTypes.revert,
                        "Invalid reveal"
                    );
                })

                it('should raise exception when reveal was already done', async function() {
                    await revealRates(this.contract, id, players);
                    await exceptions.expectThrow(
                        this.contract.reveal(
                            id,
                            players[0].rate,
                            players[0].data.rand,
                            {from: player}
                        ),
                        exceptions.errTypes.revert,
                        "Already revealed"
                    );
                })

                it('should change players info after reveal', async function() {
                    let playerData = await this.contract.getPlayer.call(id, player);
                    assert.equal(playerData[2], 0);

                    tx = await this.contract.reveal(id, players[0].rate, players[0].data.rand, {from: player});

                    playerData = await this.contract.getPlayer.call(id, player);
                    assert.equal(playerData[2], players[0].rate);
                });

                it('should change totalVotes after reveal', async function() {
                    let marketBefore = await this.contract.getMarket.call(id);
                    assert.equal(marketBefore.data[6], 0);

                    tx = await this.contract.reveal(id, players[0].rate, players[0].data.rand, {from: player});

                    marketAfter = await this.contract.getMarket.call(id);
                    assert.equal(
                        marketAfter.data[6].toString(),
                        marketBefore.data[6].add(new BN(players[0].rate * players[0].weight)).toString()
                    );
                });

                it('should change totalWeights after reveal', async function() {
                    let marketBefore = await this.contract.getMarket.call(id);
                    assert.equal(marketBefore.data[7], 0);

                    tx = await this.contract.reveal(id, players[0].rate, players[0].data.rand, {from: player});

                    marketAfter = await this.contract.getMarket.call(id);
                    assert.equal(
                        marketAfter.data[7].toString(),
                        marketBefore.data[7].add(new BN(players[0].weight)).toString()
                    );
                });

                it('should change totalWeightsByRating after reveal', async function() {
                    let weightBefore = await this.contract.getTotalWeightsByRating.call(id, players[0].rate);
                    assert.equal(weightBefore, 0);

                    tx = await this.contract.reveal(id, players[0].rate, players[0].data.rand, {from: player});

                    weightAfter = await this.contract.getTotalWeightsByRating.call(id, players[0].rate);
                    assert.equal(
                        weightAfter.toString(),
                        weightBefore.add(new BN(players[0].weight)).toString()
                    );
                });
            })
        });

        context('withdraw prize', async function() {

            beforeEach(async function() {
                await registerPlayers(this.contract, id, winners, owner);
                await postCommits(this.contract, id, players.concat(winners));

                tx = await this.contract.startReveal(id, {from: owner});
            })

            it('should raise exception when phase is not WITHDRAW', async function() {
                await exceptions.expectThrow(
                    this.contract.withdraw(id, {from: players[0].address}),
                    exceptions.errTypes.revert,
                    "Withdraw phase expected"
                );
            })

            context('in withdraw phase but nobody revealed anything', async function() {
                beforeEach(async function() {
                    tx = await this.contract.startWithdraw(id, {from: owner});
                })

                it('should raise exception if player didnt reveal his rating', async function() {
                    await exceptions.expectThrow(
                        this.contract.withdraw(id, {from: player}),
                        exceptions.errTypes.revert,
                        "Empty vote"
                    );
                })
            })

            context('in withdraw phase', async function() {
                beforeEach(async function() {
                    await revealRates(this.contract, id, players.concat(winners));
                    tx = await this.contract.startWithdraw(id, {from: owner});
                })

                it('should raise exception if player has zero weight', async function() {
                    await exceptions.expectThrow(
                        this.contract.withdraw(id, {from: playerZero}),
                        exceptions.errTypes.revert,
                        "Zero weight"
                    );
                })

                it('should raise exception if player is not a winner', async function() {
                    await exceptions.expectThrow(
                        this.contract.withdraw(id, {from: players[0].address}),
                        exceptions.errTypes.revert,
                        "You are not a winner"
                    );
                })

                it('should raise exception if double withdraw detected', async function() {
                    let winner = winners[0].address;
                    tx = await this.contract.withdraw(id, {from: winner});
                    await exceptions.expectThrow(
                        this.contract.withdraw(id, {from: winner}),
                        exceptions.errTypes.revert,
                        "Double withdraw"
                    );
                })

                it('should withdraw flag to true', async function() {
                    let winner = winners[0].address;
                    let playerData = await this.contract.getPlayer.call(id, winner);
                    assert.equal(playerData.withdrawStatus, false);

                    tx = await this.contract.withdraw(id, {from: winners[0].address});

                    playerData = await this.contract.getPlayer.call(id, winner);
                    assert.equal(playerData.withdrawStatus, true);
                })

                it('should update total withdraw', async function() {
                    let winner = winners[0].address;
                    let playerData = await this.contract.getPlayer.call(id, winner);
                    let marketData = await this.contract.getMarket.call(id);
                    let prize = playerData.weight * marketData.data[4] / marketData.data[9];

                    tx = await this.contract.withdraw(id, {from: winner});
                    let marketDataNew = await this.contract.getMarket.call(id);
                    assert.equal(
                        marketDataNew.data[8].toString(),
                        marketData.data[8].add(new BN(prize)).toString()
                    );
                })

                it('should send ether to winner', async function() {
                    let winner = winners[0].address;

                    let playerData = await this.contract.getPlayer.call(id, winner);
                    let marketData = await this.contract.getMarket.call(id);
                    let prize = playerData.weight * marketData.data[4] / marketData.data[9];
                    let winnerBalance = await web3.eth.getBalance(winner);

                    tx = await this.contract.withdraw(id, {from: winner});
                    let txInfo = await web3.eth.getTransaction(tx.tx);

                    let newWinnerBalance = await web3.eth.getBalance(winner);

                    assert.equal(
                        newWinnerBalance,
                        new BN(winnerBalance)
                        .add(new BN(prize))
                        .sub(new BN(tx.receipt.gasUsed * txInfo.gasPrice))
                        .toString()
                    );
                })
            })
        });
    });

    context('Test general functions', async function() {

        context('compute ID', async function() {
            it('should compute id', async function() {
                let code = '0x1';
                let id = await this.contract.computeId.call(code, owner);
                let expected = web3.utils.keccak256(Buffer.concat([
                    helpers.hexToBuffer(code, 32),
                    helpers.hexToBuffer(owner, 20)
                ]));
                assert.equal(id, expected);
            });
        });

        context('compute commitment', async function() {
            it('should compute commitment', async function() {
                let rate = '0x18';
                let rand = web3.utils.randomHex(32);

                let commitment = await this.contract.computeCommitment.call(rate, rand);
                let expected = web3.utils.keccak256(Buffer.concat([
                    helpers.hexToBuffer(rate, 2),
                    helpers.hexToBuffer(rand, 32)
                ]));
                assert.equal(commitment, expected);
            });
        });

        context('compute average', async function() {
            it('should compute average and round bottom', async function() {
                let avrg = await this.contract.computeAverage.call(10, 3);
                assert.equal(avrg, Math.round(10/3));
            });

            it('should compute average and round top', async function() {
                let avrg = await this.contract.computeAverage.call(17, 3);
                assert.equal(avrg, Math.round(17/3));
            });

            it('should compute average without rounding', async function() {
                let avrg = await this.contract.computeAverage.call(10, 2);
                assert.equal(avrg, Math.round(10/2));
            });

            it('should compute 0 if rating is 0', async function() {
                let avrg = await this.contract.computeAverage.call(0, 2);
                assert.equal(avrg, 0);
            });

            it('should throw exception if weights is 0', async function() {
                await exceptions.expectThrow(
                    this.contract.computeAverage.call(10, 0),
                    exceptions.errTypes.revert,
                    "Weights can't be 0"
                );
            });
        });

        context('check if a player is winner', async function() {
            let stake = web3.utils.toWei('100', 'gwei');
            let id;

            before(async function() {
                id = await this.contract.computeId.call(1, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(1, MAX_RATE, {
                    from: owner,
                    value: stake
                });
                await registerPlayers(this.contract, id, players.concat(winners), owner);
                await postCommits(this.contract, id, players.concat(winners));
                tx = await this.contract.startReveal(id, {from: owner});
                await revealRates(this.contract, id, players.concat(winners));
                tx = await this.contract.startWithdraw(id, {from: owner});
            });

            it('should return correct status for winners', async function() {
                for (i=0; i<=winners.lenght; i++) {
                    assert.equal(
                        await this.contract.isWinner.call(id, winners[i].address),
                        true
                    );
                }
            });

            it('should return correct status for loosers', async function() {
                for (i=0; i<=players.lenght; i++) {
                    assert.equal(
                        await this.contract.isWinner.call(id, players[i].address),
                        false
                    );
                }
            });
        });

        context('get players information', async function() {
            let stake = web3.utils.toWei('100', 'gwei');
            let id;

            before(async function() {
                id = await this.contract.computeId.call(1, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(1, MAX_RATE, {
                    from: owner,
                    value: stake
                });
                await registerPlayers(this.contract, id, players.concat(winners), owner);
                await postCommits(this.contract, id, players.concat(winners));
                tx = await this.contract.startReveal(id, {from: owner});
                await revealRates(this.contract, id, players.concat(winners));
                tx = await this.contract.startWithdraw(id, {from: owner});
                tx = await this.contract.withdraw(id, {from: winners[0].address});
            });

            it('should return correct players info', async function() {
                let all_players = players.concat(winners);
                for (i=0; i<=all_players.lenght; i++) {
                    let info = await this.contract.getPlayer.call(id, all_players[i].address);
                    assert.equal(info.weight, all_players[i].weight);
                    assert.equal(info.commitment, all_players[i].data.commitment);
                    assert.equal(info.vote, all_players[i].rate);
                    assert.equal(info.withdrawStatus, true);
                }
            });
        });

        context('get market information', async function() {
            let stake = web3.utils.toWei('100', 'gwei');
            let id;

            before(async function() {
                id = await this.contract.computeId.call(1, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(1, MAX_RATE, {
                    from: owner,
                    value: stake
                });
                await registerPlayers(this.contract, id, players.concat(winners), owner);
                await postCommits(this.contract, id, players.concat(winners));
                tx = await this.contract.startReveal(id, {from: owner});
                await revealRates(this.contract, id, players.concat(winners));
                tx = await this.contract.startWithdraw(id, {from: owner});
                tx = await this.contract.withdraw(id, {from: winners[0].address});
                tx = await this.contract.destroyMarket(id, {from: owner});
            });

            it('should return correct players info', async function() {
                let info = await this.contract.getMarket.call(id);
                let allPlayers = players.concat(winners);
                let rateInfo = computeRate(allPlayers);
                assert.equal(info.owner, owner);
                assert.equal(info.id, id);
                assert.equal(info.data[1], MAX_RATE);
                assert.equal(info.data[2], rateInfo.rate);
                assert.equal(info.data[3], rateInfo.distance);
                assert.equal(info.data[4], stake);
                assert.equal(info.data[5], DESTROYED);
                assert.equal(
                    info.data[6].toString(),
                    allPlayers.reduce(function(res, val) {
                        return res + val.rate*val.weight
                    }, 0)
                );
                assert.equal(
                    info.data[7],
                    allPlayers.reduce(function(res, val) {return res + val.weight}, 0)
                );

                assert.equal(
                    info.data[8].toString(),
                    Math.floor(winners[0].weight * stake / rateInfo.totalWinWeight)
                );
                assert.equal(info.data[9].toString(), rateInfo.totalWinWeight);
            });
        });


        context('get market weights for ratings', async function() {
            let stake = web3.utils.toWei('100', 'gwei');
            let id;

            before(async function() {
                id = await this.contract.computeId.call(1, owner);
            });

            beforeEach(async function() {
                let tx = await this.contract.createMarket(1, MAX_RATE, {
                    from: owner,
                    value: stake
                });
                await registerPlayers(this.contract, id, players.concat(winners), owner);
                await postCommits(this.contract, id, players.concat(winners));
                tx = await this.contract.startReveal(id, {from: owner});
                await revealRates(this.contract, id, players.concat(winners));
                tx = await this.contract.startWithdraw(id, {from: owner});
            });

            it('should return correct weights', async function() {
                let info = await this.contract.getTotalWeightsByRating.call(id, players[0].rate);
                assert.equal(info, players[0].weight);

                info = await this.contract.getTotalWeightsByRating.call(id, winners[0].rate);
                assert.equal(info, winners.reduce(function(res, val) {return res + val.weight}, 0));
            });
        });
    });
});
