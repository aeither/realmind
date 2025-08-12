// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./QuizGame.sol";

/// @title QuizNFT - NFT-based Quiz Creator Economy
/// @notice Enables creators to mint quizzes as NFTs and earn royalties from plays
contract QuizNFT is ERC721, ERC721URIStorage, IERC2981, Ownable {
    Token1 public token;
    
    struct Quiz {
        string title;
        string category;
        uint256 difficulty; // 1-5 scale
        address creator;
        uint256 playCount;
        uint256 totalEarnings;
        uint256 playFee;
        uint256 royaltyPercent; // Basis points (100 = 1%)
        bool active;
        string ipfsHash; // Metadata and questions stored on IPFS
        uint256 createdAt;
    }
    
    struct QuizPlay {
        uint256 quizId;
        address player;
        uint256 score;
        uint256 maxScore;
        uint256 feePaid;
        uint256 timestamp;
        bool passed;
    }
    
    mapping(uint256 => Quiz) public quizzes;
    mapping(uint256 => QuizPlay[]) public quizPlays;
    mapping(address => uint256[]) public creatorQuizzes;
    mapping(address => uint256[]) public playerHistory;
    
    uint256 public nextTokenId = 1;
    uint256 public constant MAX_ROYALTY_PERCENT = 1000; // 10%
    uint256 public constant PLATFORM_FEE_PERCENT = 500; // 5%
    
    event QuizMinted(uint256 indexed tokenId, address indexed creator, string title, uint256 playFee);
    event QuizPlayed(uint256 indexed tokenId, address indexed player, uint256 score, uint256 feePaid);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);
    event QuizUpdated(uint256 indexed tokenId, string newIpfsHash);
    
    constructor(address tokenAddress) ERC721("Realmind Quiz NFT", "RMNFT") Ownable(msg.sender) {
        token = Token1(tokenAddress);
    }
    
    /// @notice Mint a new quiz as NFT
    function mintQuiz(
        string memory title,
        string memory category,
        uint256 difficulty,
        uint256 playFee,
        uint256 royaltyPercent,
        string memory ipfsHash,
        string memory tokenURI_
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(difficulty >= 1 && difficulty <= 5, "Invalid difficulty");
        require(royaltyPercent <= MAX_ROYALTY_PERCENT, "Royalty too high");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        uint256 tokenId = nextTokenId++;
        
        quizzes[tokenId] = Quiz({
            title: title,
            category: category,
            difficulty: difficulty,
            creator: msg.sender,
            playCount: 0,
            totalEarnings: 0,
            playFee: playFee,
            royaltyPercent: royaltyPercent,
            active: true,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp
        });
        
        creatorQuizzes[msg.sender].push(tokenId);
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        emit QuizMinted(tokenId, msg.sender, title, playFee);
        
        return tokenId;
    }
    
    /// @notice Play a quiz and pay fees
    function playQuiz(uint256 tokenId, uint256 score, uint256 maxScore) external payable {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        Quiz storage quiz = quizzes[tokenId];
        require(quiz.active, "Quiz not active");
        require(msg.value >= quiz.playFee, "Insufficient payment");
        
        bool passed = score >= (maxScore * 60) / 100; // 60% pass rate
        
        // Record the play
        quizPlays[tokenId].push(QuizPlay({
            quizId: tokenId,
            player: msg.sender,
            score: score,
            maxScore: maxScore,
            feePaid: msg.value,
            timestamp: block.timestamp,
            passed: passed
        }));
        
        playerHistory[msg.sender].push(tokenId);
        quiz.playCount++;
        quiz.totalEarnings += msg.value;
        
        // Distribute fees
        _distributeFees(tokenId, msg.value);
        
        // Mint bonus tokens for player if they passed
        if (passed) {
            try token.mint(msg.sender, quiz.playFee * 20) {} catch {}
        }
        
        emit QuizPlayed(tokenId, msg.sender, score, msg.value);
    }
    
    /// @notice Internal function to distribute fees and royalties
    function _distributeFees(uint256 tokenId, uint256 payment) internal {
        Quiz storage quiz = quizzes[tokenId];
        uint256 royaltyAmount = (payment * quiz.royaltyPercent) / 10000;
        uint256 platformFee = (payment * PLATFORM_FEE_PERCENT) / 10000;
        
        // Pay royalty to creator
        if (royaltyAmount > 0) {
            (bool success, ) = quiz.creator.call{value: royaltyAmount}("");
            require(success, "Royalty payment failed");
            emit RoyaltyPaid(tokenId, quiz.creator, royaltyAmount);
        }
        
        // Pay platform fee to owner
        if (platformFee > 0) {
            (bool success, ) = owner().call{value: platformFee}("");
            require(success, "Platform fee payment failed");
        }
    }
    
    /// @notice Update quiz metadata (creator only)
    function updateQuizMetadata(uint256 tokenId, string memory newIpfsHash, string memory newTokenURI) external {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not quiz owner");
        
        quizzes[tokenId].ipfsHash = newIpfsHash;
        _setTokenURI(tokenId, newTokenURI);
        
        emit QuizUpdated(tokenId, newIpfsHash);
    }
    
    /// @notice Toggle quiz active status
    function toggleQuizActive(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not quiz owner");
        
        quizzes[tokenId].active = !quizzes[tokenId].active;
    }
    
    /// @notice Update quiz play fee
    function updatePlayFee(uint256 tokenId, uint256 newPlayFee) external {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not quiz owner");
        
        quizzes[tokenId].playFee = newPlayFee;
    }
    
    /// @notice Get quiz information
    function getQuizInfo(uint256 tokenId) external view returns (
        string memory title,
        string memory category,
        uint256 difficulty,
        address creator,
        uint256 playCount,
        uint256 totalEarnings,
        uint256 playFee,
        uint256 royaltyPercent,
        bool active,
        string memory ipfsHash
    ) {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        Quiz memory quiz = quizzes[tokenId];
        
        return (
            quiz.title,
            quiz.category,
            quiz.difficulty,
            quiz.creator,
            quiz.playCount,
            quiz.totalEarnings,
            quiz.playFee,
            quiz.royaltyPercent,
            quiz.active,
            quiz.ipfsHash
        );
    }
    
    /// @notice Get quiz play history
    function getQuizPlays(uint256 tokenId) external view returns (QuizPlay[] memory) {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        return quizPlays[tokenId];
    }
    
    /// @notice Get player's quiz history
    function getPlayerHistory(address player) external view returns (uint256[] memory) {
        return playerHistory[player];
    }
    
    /// @notice Get creator's quizzes
    function getCreatorQuizzes(address creator) external view returns (uint256[] memory) {
        return creatorQuizzes[creator];
    }
    
    /// @notice Get quiz statistics
    function getQuizStats(uint256 tokenId) external view returns (
        uint256 totalPlays,
        uint256 passCount,
        uint256 averageScore,
        uint256 totalRevenue
    ) {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        
        QuizPlay[] memory plays = quizPlays[tokenId];
        uint256 passCount_ = 0;
        uint256 totalScore = 0;
        uint256 playsLength = plays.length;
        
        for (uint256 i = 0; i < playsLength; i++) {
            if (plays[i].passed) {
                passCount_++;
            }
            totalScore += (plays[i].score * 100) / plays[i].maxScore;
        }
        
        uint256 averageScore_ = playsLength > 0 ? totalScore / playsLength : 0;
        
        return (
            playsLength,
            passCount_,
            averageScore_,
            quizzes[tokenId].totalEarnings
        );
    }
    
    /// @notice EIP-2981 royalty info
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view override returns (address, uint256) {
        require(_ownerOf(tokenId) != address(0), "Quiz does not exist");
        
        address creator = quizzes[tokenId].creator;
        uint256 royaltyAmount = (salePrice * quizzes[tokenId].royaltyPercent) / 10000;
        
        return (creator, royaltyAmount);
    }
    
    /// @notice Check if contract supports interface
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    /// @notice Override tokenURI to use URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /// @notice Withdraw platform fees
    function withdraw() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "Withdrawal failed");
    }
    
    receive() external payable {}
}
