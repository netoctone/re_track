class Object
  def send_chain methods
    methods.inject(self) do |obj, meth|
      obj.send meth
    end
  end
end
