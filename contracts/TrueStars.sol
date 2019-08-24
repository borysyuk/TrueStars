pragma solidity ^0.5.6;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TrueStars {

    enum Phases  {COMMIT, REVEAL, WITHDRAW, DESTROY}

    struct Player {
        uint weight;
        bytes32 commitment;
        uint vote;
        bool widthdraw;
    }

    struct Market {
        mapping (address => Player) players;
        uint8 rateRange;
        uint8 winRate;
        uint stake;
        address owner;
        Phases phase;
        uint totalVotes;
        uint totalWeights;
        mapping (uint => uint) totalWeightsByRate;
        uint totalWithdraw;
    }
    mapping (bytes32 => Market) markets;

    event MarketCreated(bytes32 indexed marketId, address indexed owner);

    event RevealPhase (bytes32 indexed marketId, address indexed owner);

    event WithdrawPhase (bytes32 indexed marketId, address indexed owner);

    event Deleted (bytes32 indexed marketId, address indexed owner);

}
