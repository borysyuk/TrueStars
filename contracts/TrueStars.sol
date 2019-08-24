pragma solidity ^0.5.6;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TrueStars {

    using SafeMath for uint;
    enum Phases {NULL, COMMIT, REVEAL, WITHDRAW, DESTROY}

    struct Player {
        uint weight;
        bytes32 commitment;
        uint vote;
        bool widthdraw;
    }

    struct Market {
        mapping (address => Player) players;
        uint8 maxRate;
        uint8 winRate;
        uint stake;
        address owner;
        Phases phase;
        uint totalVotes;
        uint totalWeights;
        mapping (uint => uint) totalWeightsByRate;
        uint totalWithdraw;
    }
    mapping (bytes32 => Market) private markets;

    event MarketCreated(
        uint indexed externalId,
        bytes32 indexed marketId,
        address indexed owner
    );

    event RevealPhase (bytes32 indexed marketId, address indexed owner);

    event WithdrawPhase (
        bytes32 indexed marketId,
        uint8 winningRate,
        uint totalPrize,
        address indexed owner
    );

    event MarketDestroyed (bytes32 indexed marketId, address indexed owner);

    /**
    * @dev Check if sender is a market owner
    * @param _marketId Market ID.
    */
    modifier onlyOwner(bytes32 _marketId) {
        require(markets[_marketId].owner == msg.sender, "You are not a market owner");
        _;
    }

    /**
    * @dev Check if phase is commit
    * @param _marketId Market ID.
    */
    modifier onlyCommit(bytes32 _marketId) {
        require(markets[_marketId].phase == Phases.COMMIT, "Commit phase expected");
        _;
    }

    /**
    * @dev Check if phase is reveal
    * @param _marketId Market ID.
    */
    modifier onlyReveal(bytes32 _marketId) {
        require(markets[_marketId].phase == Phases.REVEAL, "Commit phase expected");
        _;
    }

    /**
    * @dev Check if phase is withdraw
    * @param _marketId Market ID.
    */
    modifier onlyWithdraw(bytes32 _marketId) {
        require(markets[_marketId].phase == Phases.WITHDRAW, "Commit phase expected");
        _;
    }

    /**
    * @dev Check if phase is before withdraw
    * @param _marketId Market ID.
    */
    modifier onlyBeforeWithdraw(bytes32 _marketId) {
        require(
            markets[_marketId].phase == Phases.COMMIT ||
            markets[_marketId].phase == Phases.REVEAL,
            "Commit or reveal phase expected");
        _;
    }

    /**
    * @dev create Market.
    * @param _id market ID
    * @param _maxRate max possible rating for this market.
    */
    function createMarket(uint _id, uint8 _maxRate)
        public
        payable
        returns (bytes32)
    {
        Market memory market;
        bytes32 id = keccak256(abi.encodePacked(_id, msg.sender));
        require(markets[id].phase == Phases.NULL);

        market.maxRate = _maxRate;
        market.stake = msg.value;
        market.owner = msg.sender;
        market.phase = Phases.COMMIT;
        markets[id] = market;

        emit MarketCreated(_id, id, msg.sender);
        return id;
    }

    /**
    * @dev Change state to reveal
    * @param _id market ID
    */
    function startReveal(bytes32 _id)
        public
        onlyOwner(_id)
        onlyCommit(_id)
        returns (bool)
    {
        markets[_id].phase = Phases.REVEAL;
        emit RevealPhase(_id, msg.sender);
        return true;
    }

    /**
    * @dev Change state to withdraw
    * @param _id market ID
    */
    function startWithdraw(bytes32 _id)
        public
        onlyOwner(_id)
        onlyReveal(_id)
        returns (bool)
    {
        markets[_id].phase =  Phases.WITHDRAW;
        //...........................TODO
        emit WithdrawPhase(
            _id,
            markets[_id].winRate,
            markets[_id].stake,
            msg.sender);
        return true;
    }

    /**
    * @dev Change state to destroyed and transfer rest of the money to an owner
    * @param _id market ID
    */
    function destroyMarket(bytes32 _id)
        public
        onlyOwner(_id)
        onlyWithdraw(_id)
        returns (bool)
    {
        markets[_id].phase = Phases.DESTROY;
        emit MarketDestroyed(_id, msg.sender);
        msg.sender.transfer(markets[_id].stake - markets[_id].totalWithdraw);
        return true;
    }

    /**
    * @dev Return current market state
    * @param _id market ID
    */
    function getPhase(bytes32 _id)
        public
        view
        returns (Phases)
    {
        return markets[_id].phase;
    }

    /**
    * @dev Add fund to the market
    * @param _id market ID
    */
    function fundMarket(bytes32 _id)
        public
        onlyBeforeWithdraw(_id)
        payable
        returns (bool)
    {
        markets[_id].stake.add(msg.value);
        return true;
    }






}
