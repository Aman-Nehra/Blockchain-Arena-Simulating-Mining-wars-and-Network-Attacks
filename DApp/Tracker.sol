// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tracker {
    
    // Item Struct
    struct Item{
        uint256 id;
        string name;
        address owner;
    }

    // State variables
    mapping(uint256 => Item) public items;  // mapping from item ID to Item Struct
    uint256 public ItemCounter; // counter to generate unique ID for each item

    // Events
    event ItemRegistered(uint256 indexed id,address indexed owner,string name);
    event OwnershipTransferred(uint256 indexed id, address indexed from,address indexed to);

    // Functions
    // Register a new item
    function registerItem(string memory _name) public {
        ItemCounter += 1;
        items[ItemCounter] = Item({
            id : ItemCounter,
            name : _name,
            owner : msg.sender 
        });
        emit ItemRegistered(ItemCounter, msg.sender, _name);
    }

    // transfer ownership
    function transferOwnership(uint256 _id , address _newOwner) public {
        Item storage item = items[_id];
        require(msg.sender == item.owner, "Only the current owner can transfer ownership");
        require(_newOwner != address(0), "New Owner cannot be zero address");

        address previousOwner = item.owner;
        item.owner = _newOwner;

        emit OwnershipTransferred(_id,previousOwner,_newOwner); 
    }
}