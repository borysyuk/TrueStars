pragma solidity ^0.5.6;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TrueStars {

    using SafeMath for uint;
    enum Phases {NULL, COMMIT, REVEAL, WITHDRAW, DESTROYED}
    uint constant MAX_ALLOWED_RATING = 100;

    struct Player {
        uint weight;
        bytes32 commitment;
        uint vote;
        bool withdraw;
    }

    struct Market {
        mapping (address => Player) players;
		uint code;
        uint8 maxRating;
        uint8 winRating;
        uint8 winDistance;
        uint stake;
        address owner;
        Phases phase;
        uint totalVotes;
        uint totalWeights;
        mapping (int => uint) totalWeightsByRating;
        uint totalWithdraw;
        uint totalWinWeight;
    }

    mapping (bytes32 => Market) private markets;

    event MarketCreated(
        uint indexed marketCode,
        bytes32 indexed marketId,
        address indexed owner
    );

    event RevealPhase (bytes32 indexed marketId, address indexed owner);

    event WithdrawPhase (
        bytes32 indexed marketId,
        uint8 winningRating,
        uint8 winDistance,
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
        require(markets[_marketId].phase == Phases.REVEAL, "Reveal phase expected");
        _;
    }

    /**
    * @dev Check if phase is withdraw
    * @param _marketId Market ID.
    */
    modifier onlyWithdraw(bytes32 _marketId) {
        require(markets[_marketId].phase == Phases.WITHDRAW, "Withdraw phase expected");
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
    * @param _code market name (represented as a numnber).
    * @param _maxRating max possible rating for this market.
    */
    function createMarket(uint _code, uint8 _maxRating)
        public
        payable
        returns (bytes32)
    {
        Market memory market;
        bytes32 id = computeId(_code, msg.sender);
        require(markets[id].phase == Phases.NULL, "Already exists");
        require(_maxRating <= MAX_ALLOWED_RATING, "Max rating is too big");

		market.code = _code;
        market.maxRating = _maxRating;
        market.stake = msg.value;
        market.owner = msg.sender;
        market.phase = Phases.COMMIT;
        markets[id] = market;

        emit MarketCreated(_code, id, msg.sender);
        return id;
    }

    /**
    * @dev map market name to market ID. (The mapping depends on who the owner of the market is.)
    * @param _code market name
    * @param _owner Owner of the market
    */
    function computeId(uint _code, address _owner)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_code, _owner));
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

        if (markets[_id].totalWeights > 0) {
            markets[_id].winRating = uint8((1 + 2 * markets[_id].totalVotes /  markets[_id].totalWeights) / 2);
            for (int i=0; i<=markets[_id].maxRating; i++) {
                if (
                    (markets[_id].totalWeightsByRating[markets[_id].winRating + i] > 0 ) ||
                    (markets[_id].totalWeightsByRating[markets[_id].winRating - i] > 0 )
                ) {
                    markets[_id].winDistance = uint8(i);
                    break;
                }
            }
            markets[_id].totalWinWeight =
                markets[_id].totalWeightsByRating[markets[_id].winRating + markets[_id].winDistance] +
                markets[_id].totalWeightsByRating[markets[_id].winRating - markets[_id].winDistance];
        }

        emit WithdrawPhase(
            _id,
            markets[_id].winRating,
            markets[_id].winDistance,
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
        markets[_id].phase = Phases.DESTROYED;
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

    /**
    * @dev Add a player to the market
    * @param _id market ID
    * @param _player player's address
    * @param _weight player's weight
    */
    function registerPlayer(bytes32 _id, address _player, uint _weight)
        public
        onlyOwner(_id)
        onlyBeforeWithdraw(_id)
        returns (bool)
    {
        if (markets[_id].players[_player].weight != 0) {
            markets[_id].players[_player].weight = _weight;
        } else {
            markets[_id].players[_player] = Player(_weight, 0, 0, false);
        }
        return true;
    }

    /**
    * @dev Add vote commitment
    * @param _id market ID
    * @param _commitment hashed vote
    */
    function commit(bytes32 _id, bytes32 _commitment)
        public
        onlyCommit(_id)
        returns (bool)
    {
        markets[_id].players[msg.sender].commitment = _commitment;
        return true;
    }

	/**
    * @dev map rating and salt to a commitment. Used for commit-reveal mechanism.
    * @param _rating rating (range 1 to maxRating)
    * @param _salt Randomly-generated salt
    */
    function computeCommitment(uint _rating, uint _salt)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_rating, _salt));
    }


    /**
    * @dev Reveal your vote
    * @param _id market ID
    * @param _rating vote
    * @param _salt the random salt that was used when generating the commitment
    */
    function reveal(bytes32 _id, uint _rating, uint _salt)
        public
        onlyReveal(_id)
        returns (bool)
    {
        address player = msg.sender;
        require(
            computeCommitment(_rating, _salt) == markets[_id].players[player].commitment &&
            markets[_id].players[player].commitment != 0,
            "Invalid reveal"
        );
        require(
            markets[_id].players[player].vote == 0,
            "Already revealed"
        );
        require(_rating >= 1 && _rating <= markets[_id].maxRating, "Invalid rating");

        markets[_id].players[player].vote = _rating;
        uint weight = markets[_id].players[player].weight;
        markets[_id].totalVotes.add(_rating * weight);
        markets[_id].totalWeights.add(weight);
        markets[_id].totalWeightsByRating[int(_rating)].add(weight);

        return true;
    }

    /**
    * @dev withdraw
    * @param _id market ID
    */
    function withdraw(bytes32 _id)
        public
        onlyWithdraw(_id)
        returns (bool)
    {
        address payable player = msg.sender;
        require(
            markets[_id].players[player].weight > 0,
            "Zero weight"
        );
        require(
            int(markets[_id].players[player].vote) == int(markets[_id].winRating) + int(markets[_id].winDistance) ||
            int(markets[_id].players[player].vote) == int(markets[_id].winRating) - int(markets[_id].winDistance),
            "Are not a winner"
        );
        require(
            markets[_id].players[player].withdraw == false,
            "Double withdraw"
        );

        require(
            markets[_id].players[player].vote != 0,
            "Empty vote"
        );

        markets[_id].players[player].withdraw = true;
        uint prize = markets[_id].players[player].weight*markets[_id].stake / markets[_id].totalWinWeight;
        markets[_id].totalWithdraw.add(prize);
        assert(markets[_id].totalWithdraw <= markets[_id].stake);
        player.transfer(prize);
        return true;
    }

    /**
    * @dev Return current market state
    * @param _id market ID
    * @return uint[9] (code, maxRating, winRating, winDistance, stake, phase,
    * totalVotes, totalWeights, totalWithdraw, totalWinWeight)
    * @return owner address
    */
    function getMarket(bytes32 _id)
        public
        view
        returns (
            uint[10] memory data,
            address owner
        )
    {
        data[0] = markets[_id].code;
        data[1] = uint(markets[_id].maxRating);
        data[2] = uint(markets[_id].winRating);
        data[3] = uint(markets[_id].winDistance);
        data[4] = markets[_id].stake;
        data[5] = uint(markets[_id].phase);
        data[6] = markets[_id].totalVotes;
        data[7] = markets[_id].totalWeights;
        data[8] = markets[_id].totalWithdraw;
        data[9] = markets[_id].totalWinWeight;

        return (
            data,
            markets[_id].owner
        );
    }

    /**
    * @dev Return player
    * @param _id market ID
    * @param _player player's address
    */
    function getPlayer(bytes32 _id, address _player)
        public
        view
        returns (
                uint weight,
                bytes32 commitment,
                uint vote,
                bool withdrawStatus
        )
    {
        return (
            markets[_id].players[_player].weight,
            markets[_id].players[_player].commitment,
            markets[_id].players[_player].vote,
            markets[_id].players[_player].withdraw
        );
    }

    /**
    * @dev check if a player isWinner
    * @param _id market ID
    * @param _player player's address
    */
    function isWinner(bytes32 _id, address _player)
        public
        view
        returns (bool)
    {
        if(
            int(markets[_id].players[_player].vote) == int(markets[_id].winRating) + int(markets[_id].winDistance) ||
            int(markets[_id].players[_player].vote) == int(markets[_id].winRating) - int(markets[_id].winDistance)
        ) {
            return true;
        }
        return false;
    }
}
