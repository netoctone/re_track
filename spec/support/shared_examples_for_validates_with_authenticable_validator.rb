shared_examples_for "validates_with AuthenticableValidator" do
  describe "valid?" do
    it "tries to create service instance" do
      service.should_receive(:new).with(
        hash_including({
          :login => 'login',
          :password => 'password'
        })
      )
      valid_record.valid?
    end

    context "when url specified" do
      it "tries to create service instance passing url" do
        if valid_record.respond_to? :url=
          valid_record.url = 'the url'
          service.should_receive(:new).with(hash_including(:url => 'the url'))
          valid_record.valid?
        end
      end
    end

    context "when proxy specified" do
      it "tries to create service instance passing proxy" do
        if valid_record.respond_to? :proxy=
          valid_record.proxy = 'prx'
          service.should_receive(:new).with(hash_including(:proxy => 'prx'))
          valid_record.valid?
        end
      end
    end
  end
end
