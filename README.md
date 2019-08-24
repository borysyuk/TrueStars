# TrueStars

Created in EthZweiBerlin by:
- Ihor Borysyuk
- Igor Dulger
- Elad Verbinv

## Inspiration

Star Ratings are broken: On Uber and Amazon, on Google Maps and Deliveroo, and everywhere else. No one leaves ratings, and if they do, it's because they're upset, or paid shills. This is not surprising: users are not incentivized to rate honestly, so why would they? TrueStars aims to fix that.  TrueStars is a cryptoeconomic mechanism that incentives users to give star ratings -- and to be truthful when giving them!

TrueStars is meant to be subsidized by the entity that benefits from having correct ratings (e.g. Uber or Amazon). The larger the subsidy, the more incentive there is for the users to rate truthfully. But since the users are the people who took the rides, or bought the product, there is no possibility to game the system.

For the hackathon, we implement this system for rating the projects in EthZweiBerlin -- each hacker can rate each project, and the users who gave the correct ranking will win prizes.

## What it does

Each hacker in EthZweiBerlin can rate each project. The ratings are given using a commit-reveal system, so that no one knows what ratings were given to a project, until all ratings are in. After all commitments are in, the final ratings of the projects are calculated in the reveal phase by averaging the ratings given by all hackers. Finally, for each project, the hacker whose rating was closest to the final rating, wins the prize pool for that project. (Seeded by us.)

Therefore, each hacker's rating represents their opinion. But it also represents their guess on what *other people* will think. This is a mechanism that looks for the Schelling point, but it also avoids many of the traditional problems faced by prediction markets, because it's difficult to speculate in such a one-shot commit-reveal voting system.

## Future Vision

When True Stars is used by Uber (for example), a "market" is created for each driver. This prize pool for this market is seeded with prize money by Uber, for example 5% of the fees that Uber takes from that drivers' rides. Each time that a user takes a ride with a driver, the user gets to leave a rating with the driver. At the end of the month, the user who guessed the correct average rating, wins the prize pool.

## How we built it

We started out by sketching a solid cryptoeconomic system that can fix star ratings. We then built a PoC for this system in Python (for quick prototyping). This allowed us to quickly iterate on any points that were under-specified. Finally, we programmed the system in Solidity, and wrote unit tests in XXXX.

## Challenges we ran into

## Accomplishments that we're proud of

## What we learned

## What's next for TrueStars

1. **Business Development.** We thinks this system can solve the problems of Uber, Netflix, Amazon, and many others. The implementation for Uber doesn't need to be decentralized -- it can be done using a ServerCoin, and prizes can be given in Uber credit. But for decentralized Uber/Amazon/etc (e.g. OpenBazaar or Arcade City), the smart contract should be used. OpenBazaar's smart contracts themselves can directly interact with TrueStars and run the star ratings system.

2. **Avoiding Ratings** Inflation by rating on a curve* The crypto-economics of TrueStars can be improved to prevent "ratings inflation". Specifically, the rated entities (e.g. drivers) should be split into cohorts. And the average rankings of an entire cohort need to be sorted and re-normalized amongst themselves before evaluating the ratings. This avoids "ratings inflation".

3. **Make the system Incentive-Aligned** When ranking Uber drivers, the most likely rating for next month is the same as for this month. Users know this, so they are incentivized to rate the same as last month, leading to "ratings stagnation". We know how to improve the cryptoeconomics to avoid this: by splitting the prize pool based on the "prior rating", we can incentivize users to take "bold guesses" e.g. to guess that a driver that last month had 5 stars will actually get 2 stars this month. Users that make this 5->2 guess will compete over the same large prize pool, and thus if they are correct, will win big. This incentivizes them to make such a guess, and in fact we believe this makes the system incentive-aligned (assuming users don't collude).

4. **UI.** We'd like to show many indicators about the system in a snazzy app.

5. **UX.** There are many things to improve around UX. Right now the user needs to authorize three different transactions for each rating they give: one time when they commit, one time when they reveal, and one time when they withdraw their prize. We'd like to let an app create a dedicated wallet for the system, so that all of these authorizations will be done automatically behind the scenes. Our goal is to bring the ease-of-use of the TrueStars system to be exactly as easy as giving a traditional star rating like in Uber.

6. **User stories.** We'd like to outline user stories for many types of use cases: Uber, Amazon, Foodora, are all slightly different. We'd like to outline suggested integrations with all of these kinds of systems, and their decentralized counterparts.

## How to install

```
$  git clone git@git@github.com:borysyuk/TrueStars.git MY_DIR
OR
$  git clone https://git@github.com:borysyuk/TrueStars.git MY_DIR
```

```
$ cd MY_DIR
$ npm install
```
 Start in another terminal

 ```
 $ ganache-cli
 ```

 copy mnemonic string and save it, you will see something like this  

 ```
  HD Wallet
 ==================
 Mnemonic:      make dog coffee child enough boy write sauce polar sport problem junior
 ```
 Return to the terminal where you installed the project

### Compile solidity contracts
```
$ truffle compile
```

### Check that all tests a passed
```
$ truffle test
```

### Deploy contracts to local blockchain
```
$ truffle migrate --reset
```

### Start web server localhost:3000
```
$ npm run start
```

We deployed the project to Rinkeby
https://rinkeby.etherscan.io/address/0x5d78037a81bfd7c63fcf3873c9f5b5449adee1a6#code
