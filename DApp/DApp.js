const contractAddress = "0x07A7e42e890c4bF0953CF38FC42Fef4668E989ec";
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "ItemRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "registerItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ItemCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "items",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider, signer, contract;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    setupEventListeners();
    listItems();
  } else {
    alert("Please install MetaMask!");
  }
});

document.getElementById("connectButton").onclick = async () => {
  try {
    await provider.send("eth_requestAccounts", []);
    const accounts = await provider.listAccounts();
    console.log("Connected account:", accounts[0]);
    alert("Wallet connected: " + accounts[0]);
  } catch (err) {
    console.error("Connection failed:", err);
    alert("Failed to connect wallet. Check console.");
  }
};

async function registerItem() {
  const name = document.getElementById("itemName").value;
  if (!name) return alert("Enter a name!");

  try {
    console.log("Calling registerItem with name:", name);
    const tx = await contract.registerItem(name);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed");
  } catch (err) {
    console.error("Error during registerItem:", err);
    alert("Failed to register item. See console for details.");
  }
}

async function listItems() {
  const filter = contract.filters.ItemRegistered();
  const events = await contract.queryFilter(filter, 0, "latest");
  const list = document.getElementById("itemList");
  list.innerHTML = "";

  for (let e of events) {
    const { id, owner, name } = e.args;
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${name}</strong> (ID: ${id})<br/>Owner: ${owner}</p>
      <input placeholder="New Owner Address" id="input-${id}" />
      <button onclick="transfer(${id})">Transfer</button>
      <button onclick="viewHistory(${id})">View History</button>
      <hr/>
    `;
    list.appendChild(div);
  }
}

async function transfer(id) {
  const newOwner = document.getElementById(`input-${id}`).value;
  if (!newOwner) return alert("Enter new owner address!");
  await contract.transferOwnership(id, newOwner);
}

async function viewHistory(id) {
  const filter = contract.filters.OwnershipTransferred(id);
  const events = await contract.queryFilter(filter, 0, "latest");
  const history = events.map(e => `${e.args.from} → ${e.args.to}`).join("\n");
  alert(`Ownership history for Item ${id}:\n` + history);
}

function setupEventListeners() {
  contract.on("ItemRegistered", (id, owner, name) => {
    console.log(`New item registered: ${name} (${id})`);
    listItems();
  });
  contract.on("OwnershipTransferred", (id, from, to) => {
    console.log(`Ownership transferred: ${from} → ${to}`);
    listItems();
  });
}