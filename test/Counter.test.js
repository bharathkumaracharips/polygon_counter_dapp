const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", function () {
  let Counter;
  let counter;
  let owner;
  let addr1;

  beforeEach(async function () {
    Counter = await ethers.getContractFactory("Counter");
    [owner, addr1] = await ethers.getSigners();
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the initial count to 0", async function () {
      expect(await counter.getCount()).to.equal(0);
    });

    it("Should have the correct initial count value", async function () {
      expect(await counter.count()).to.equal(0);
    });
  });

  describe("Increment", function () {
    it("Should increment the counter by 1", async function () {
      await counter.increment();
      expect(await counter.getCount()).to.equal(1);
    });

    it("Should increment multiple times correctly", async function () {
      await counter.increment();
      await counter.increment();
      await counter.increment();
      expect(await counter.getCount()).to.equal(3);
    });

    it("Should emit CounterIncremented event", async function () {
      await expect(counter.increment())
        .to.emit(counter, "CounterIncremented")
        .withArgs(1, owner.address);
    });

    it("Should emit correct event data for multiple increments", async function () {
      await counter.increment(); // count = 1
      
      await expect(counter.connect(addr1).increment())
        .to.emit(counter, "CounterIncremented")
        .withArgs(2, addr1.address);
    });
  });

  describe("Multiple users", function () {
    it("Should allow different users to increment", async function () {
      await counter.connect(owner).increment();
      await counter.connect(addr1).increment();
      expect(await counter.getCount()).to.equal(2);
    });
  });
});